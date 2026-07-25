import io
import logging
# pyrefly: ignore [missing-import]
import edge_tts

logger = logging.getLogger("tts_service")

class TTSService:
    def __init__(self, default_voice: str = "en-US-ChristopherNeural"):
        self.default_voice = default_voice

    async def generate_speech_bytes(self, text: str, voice: str = None) -> bytes:
        selected_voice = voice or self.default_voice
        try:
            communicate = edge_tts.Communicate(text, selected_voice)
            buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    buffer.write(chunk["data"])
            buffer.seek(0)
            return buffer.read()
        except Exception as e:
            logger.error(f"Edge TTS error: {e}")
            raise e

tts_service = TTSService()
