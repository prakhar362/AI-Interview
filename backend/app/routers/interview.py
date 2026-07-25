# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    GenerateQuestionsRequest, GenerateQuestionsResponse,
    FollowUpRequest, FollowUpResponse
)
from app.services.gemini_service import gemini_service
from app.prompts.question_generation import QUESTION_GENERATION_SYSTEM_PROMPT
from app.prompts.answer_evaluation import FOLLOW_UP_SYSTEM_PROMPT

router = APIRouter(prefix="/api", tags=["Interview Flow"])

@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(payload: GenerateQuestionsRequest):
    prompt = f"""
Candidate Resume:
{payload.resume_text}

Target Job Description:
{payload.jd_text if payload.jd_text else "General Role based on candidate resume."}

Generate EXACTLY 22 balanced interview questions following the exact category breakdown and dynamic difficulty progression.
"""
    try:
        data = await gemini_service.generate_json(prompt, QUESTION_GENERATION_SYSTEM_PROMPT)
        questions = data.get("questions", [])
        return GenerateQuestionsResponse(questions=questions, total_count=len(questions))
    except Exception as e:
        import logging
        logging.getLogger("interview_router").error(f"generate_questions failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/follow-up", response_model=FollowUpResponse)
@router.post("/interview/follow-up", response_model=FollowUpResponse)
async def generate_follow_up(payload: FollowUpRequest):
    user_ans = payload.get_candidate_answer()
    prompt = f"""
Question Asked: {payload.question}
Candidate Spoken Answer: {user_ans}
Context: {payload.context or ''}
Evaluation Context: {payload.evaluation or {}}
"""
    try:
        data = await gemini_service.generate_json(prompt, FOLLOW_UP_SYSTEM_PROMPT)
        follow_q = data.get("followUpQuestion") or data.get("follow_up_question")
        return FollowUpResponse(
            followUpQuestion=follow_q,
            follow_up_question=follow_q,
            difficulty=data.get("difficulty", "medium"),
            isFollowUp=True,
            needs_follow_up=data.get("needs_follow_up", True)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

