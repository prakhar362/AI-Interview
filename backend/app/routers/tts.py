from fastapi import APIRouter, HTTPException, Response
from app.models.schemas import TTSRequest
from app.services.tts_service import tts_service

router = APIRouter(prefix="/api", tags=["Text to Speech"])

@router.post("/speak")
@router.post("/tts/speak")
async def speak(payload: TTSRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    try:
        audio_bytes = await tts_service.generate_speech_bytes(payload.text, payload.voice)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS Generation failed: {str(e)}")

