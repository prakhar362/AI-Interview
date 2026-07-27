import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import resume, interview, coding, evaluation, tts, upload
app = FastAPI(
    title="AI Interview Simulator API",
    description="Stateless backend API for AI Interview Simulator powered by Gemini and Edge TTS",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*","https://ai-interview-peach-eta.vercel.app"],  # Permits local React app requests
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(coding.router)
app.include_router(evaluation.router)
app.include_router(tts.router)
app.include_router(upload.router)

# Root-level API aliases to support non-prefixed API contracts from other modules
@app.post("/tts/speak")
async def tts_speak_alias(payload: tts.TTSRequest):
    return await tts.speak(payload)

@app.post("/interview/evaluate-answer")
async def evaluate_answer_alias(payload: evaluation.EvaluateAnswerRequest):
    return await evaluation.evaluate_answer(payload)

@app.post("/interview/follow-up")
async def follow_up_alias(payload: interview.FollowUpRequest):
    return await interview.generate_follow_up(payload)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "gemini_api_key_configured": bool(settings.GEMINI_API_KEY),
        "model": settings.DEFAULT_MODEL
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
