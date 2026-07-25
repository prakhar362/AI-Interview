# AI Interview Simulator - Backend

Stateless FastAPI backend powering Gemini-based AI question generation, speech evaluation, code execution simulation, Edge TTS audio, and final report compilation.

## Tech Stack
- Python 3.10+
- FastAPI
- Google Gemini API (`google-genai`)
- Edge TTS (`edge-tts`)
- Pydantic v2
- PyPDF

## Setup & Running

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env
# Edit .env and set your GEMINI_API_KEY

# 3. Run server
python -m uvicorn app.main:app --reload --port 8000
```
