import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    EvaluateAnswerRequest, EvaluateAnswerResponse,
    FinalReportRequest, FinalReportResponse
)
from app.services.evaluation_service import evaluation_service

logger = logging.getLogger("evaluation_router")

router = APIRouter(prefix="/api", tags=["Answer Evaluation & Final Report"])


@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
@router.post("/interview/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_answer(payload: EvaluateAnswerRequest):
    """
    Features 18–22: AI Answer Refactoring, Technical Accuracy Scoring,
    Communication Scoring, Behavioral & HR Evaluation.
    Single Gemini call — delegates all logic to EvaluationService.
    """
    try:
        # Use schema helper methods to normalise camelCase / snake_case field names
        result = await evaluation_service.evaluate_answer(
            question_id=payload.question_id or 0,
            question_text=payload.get_question_text(),
            question_type=payload.question_type or "technical",
            difficulty=payload.difficulty or "medium",
            user_answer=payload.get_user_answer(),
            candidate_resume_context=payload.get_resume_context(),
        )
        return EvaluateAnswerResponse(**result)
    except Exception as e:
        logger.error(f"evaluate_answer error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/final-report", response_model=FinalReportResponse)
async def generate_final_report(payload: FinalReportRequest):
    """
    Features 23–24: Strength & Weakness Analysis, Overall Rating & Personalized Feedback.
    Numeric scores computed in Python. Single Gemini call for qualitative synthesis.
    """
    try:
        # Support both camelCase and snake_case field names from different frontend versions
        cand_info  = payload.candidateInfo  if payload.candidateInfo  is not None else (payload.candidate_info  or {})
        sess_id    = payload.sessionId      if payload.sessionId      is not None else (payload.session_id      or "")
        q_evals    = payload.questionsAndEvaluations if payload.questionsAndEvaluations is not None else (payload.questions_and_evaluations or [])
        c_evals    = payload.codingEvaluations       if payload.codingEvaluations       is not None else (payload.coding_evaluations       or [])
        face_count = payload.faceMissingCount        if payload.faceMissingCount        is not None else (payload.face_missing_count        or 0)

        result = await evaluation_service.generate_final_report(
            candidate_info=cand_info,
            session_id=sess_id,
            questions_and_evaluations=q_evals,
            coding_evaluations=c_evals,
            face_missing_count=face_count,
        )
        return FinalReportResponse(**result)
    except Exception as e:
        logger.error(f"generate_final_report error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
