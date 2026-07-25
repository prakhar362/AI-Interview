"""
gemini_service.py
-----------------
Pure Gemini AI generation service using Google Gemini LLMs.
Uses Gemini 2.5 Flash / Flash Lite models for all AI operations.
"""

import asyncio
import json
import re
import logging
from typing import Dict, Any, List

from app.config import settings

logger = logging.getLogger("gemini_service")


class GeminiService:

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.default_model = settings.DEFAULT_MODEL or "gemini-3.5-flash-lite"
        self._gemini_client = None
        self._use_new_sdk = False
        self._init_client()

    def _init_client(self):
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set in .env")
            return

        try:
            from google import genai
            self._gemini_client = genai.Client(api_key=self.api_key)
            self._use_new_sdk = True
            logger.info("Gemini Service initialized using new 'google-genai' SDK.")
        except ImportError:
            try:
                import google.generativeai as genai_old
                genai_old.configure(api_key=self.api_key)
                self._use_new_sdk = False
                logger.info("Gemini Service initialized using legacy 'google.generativeai' SDK.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini SDK: {e}")

    def clean_json_string(self, text: str) -> str:
        """Strip markdown code fences from model output."""
        text = text.strip()
        match = re.search(r"^```(?:json)?\s*(.*?)\s*```$", text, re.DOTALL)
        if match:
            text = match.group(1).strip()
        return text

    async def generate_json(self, prompt: str, system_instruction: str = "") -> Dict[str, Any]:
        """Generate content using Gemini models and return parsed JSON."""
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing from .env")

        full_prompt = (
            f"{system_instruction}\n\nUser Request:\n{prompt}"
            if system_instruction else prompt
        )

        models: List[str] = [
            "gemini-3.5-flash-lite",
            settings.DEFAULT_MODEL,
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-flash-8b",
        ]
        # Remove empty string or None, deduplicate while preserving order
        models = [m for m in models if m]
        models = list(dict.fromkeys(models))

        last_error = None
        for model in models:
            try:
                if self._use_new_sdk and self._gemini_client:
                    response = self._gemini_client.models.generate_content(
                        model=model,
                        contents=full_prompt,
                    )
                    raw_text = response.text
                else:
                    import google.generativeai as genai_old
                    m = genai_old.GenerativeModel(model)
                    response = m.generate_content(full_prompt)
                    raw_text = response.text

                return self._parse_json(raw_text, model)

            except json.JSONDecodeError as e:
                last_error = e
            except Exception as e:
                logger.warning(f"Gemini model {model} failed: {e}. Trying next model...")
                last_error = e
                if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                    await asyncio.sleep(2)

        logger.error(f"All Gemini model attempts failed. Last error: {last_error}")
        raise last_error

    def _parse_json(self, raw_text: str, model: str) -> Dict[str, Any]:
        """Clean and parse JSON; try regex extraction on failure."""
        cleaned = self.clean_json_string(raw_text)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as err:
            logger.error(f"JSON parse error from model {model}: {err}")
            match = re.search(r'(\{.*\}|\[.*\])', cleaned, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise


gemini_service = GeminiService()
