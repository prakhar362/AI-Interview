# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, UploadFile, File
from app.services.pdf_service import pdf_service
from app.models.schemas import AnalyzeResumeRequest, ResumeAnalysisResponse
# Import the analyze_resume function so we can chain the extraction directly into analysis
from app.routers.resume import analyze_resume

router = APIRouter(prefix="/api/upload", tags=["Upload"])

@router.post("/resume", response_model=ResumeAnalysisResponse)
async def upload_resume_pdf(file: UploadFile = File(...)):
    """
    Handles Feature 3: Resume Upload and Text Extraction.
    """
    # 1. Validation: Ensure the user actually uploaded a PDF
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Uploaded file must be a PDF.")

    try:
        # 2. In-Memory Reading: Read the raw bytes of the file (no saving to disk!)
        contents = await file.read()
        
        # 3. Extraction: Pass the raw bytes to our pdf_service
        extracted_text = pdf_service.extract_text_from_bytes(contents)
        
        # 4. Handoff: Forward the extracted text immediately to Feature 4 (Analysis)
        return await analyze_resume(AnalyzeResumeRequest(resume_text=extracted_text))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
