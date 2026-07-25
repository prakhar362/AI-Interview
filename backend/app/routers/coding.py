from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ExecuteCodeRequest, ExecuteCodeResponse,
    ReviewCodeRequest, ReviewCodeResponse,
    CodingTemplate, GenerateCodingRequest
)
from app.services.code_execution_service import code_execution_service
from app.services.coding_service import code_review_service
from app.services.gemini_service import gemini_service
from app.prompts.coding_prompt import CODING_QUESTION_GENERATION_PROMPT

router = APIRouter(prefix="/api", tags=["Coding Challenges"])

@router.post("/generate-coding-question", response_model=CodingTemplate)
async def generate_coding_question(payload: GenerateCodingRequest):
    prompt = CODING_QUESTION_GENERATION_PROMPT.format(
        language=payload.language,
        resume_context=payload.resume_context
    )
    try:
        data = await gemini_service.generate_json(prompt)
        return CodingTemplate(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute-code", response_model=ExecuteCodeResponse)
async def execute_code(payload: ExecuteCodeRequest):
    try:
        res = await code_execution_service.execute_and_test(
            problem_statement=payload.problem_statement,
            code=payload.code,
            language=payload.language,
            test_cases=payload.test_cases
        )
        return ExecuteCodeResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review-code", response_model=ReviewCodeResponse)
async def review_code(payload: ReviewCodeRequest):
    try:
        res = await code_execution_service.review_code(
            problem_statement=payload.problem_statement,
            code=payload.code,
            language=payload.language,
            execution_results=payload.execution_results
        )
        return ReviewCodeResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/coding/review", response_model=ReviewCodeResponse)
async def coding_review_new(payload: ReviewCodeRequest):
    try:
        res = await code_review_service.review_code(
            problem_statement=payload.problem_statement,
            code=payload.code,
            language=payload.language,
            test_cases=payload.test_cases
        )
        return ReviewCodeResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
