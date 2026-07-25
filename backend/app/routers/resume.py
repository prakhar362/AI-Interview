from fastapi import APIRouter, HTTPException, UploadFile, File
from app.models.schemas import (
    AnalyzeResumeRequest, ResumeAnalysisResponse,
    AnalyzeJDRequest, JDAnalysisResponse
)
from app.services.gemini_service import gemini_service
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/api", tags=["Resume & JD Analysis"])

@router.post("/analyze-resume", response_model=ResumeAnalysisResponse)
async def analyze_resume(payload: AnalyzeResumeRequest):
    if not payload.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")

    prompt = f"""
Analyze the following resume text and return structured JSON:
Resume Text:
{payload.resume_text}

JSON Format required:
{{
  "candidate_name": "John Doe",
  "summary": "Brief 2-3 sentence background summary",
  "skills": ["Python", "React", "Docker"],
  "projects": [{{ "name": "Project Alpha", "tech": ["FastAPI", "PostgreSQL"], "description": "Built scalable API" }}],
  "experience_years": 3.5,
  "strengths": ["Backend Systems", "Problem Solving"]
}}
"""
    try:
        data = await gemini_service.generate_json(prompt)
        return ResumeAnalysisResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-jd", response_model=JDAnalysisResponse)
async def analyze_jd(payload: AnalyzeJDRequest):
    prompt = f"""
Analyze the target Job Description against the Candidate Resume context (if provided):

Job Description:
{payload.jd_text}

Resume Context:
{payload.resume_text}

Return JSON:
{{
  "role_title": "Senior Frontend Engineer",
  "required_skills": ["React", "TypeScript", "Performance Tuning"],
  "skill_gaps": ["GraphQL"],
  "fit_score": 85.0,
  "key_focus_areas": ["State management", "Frontend optimization"]
}}
"""
    try:
        data = await gemini_service.generate_json(prompt)
        return JDAnalysisResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
