from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

# --- Resume & JD Models ---

class AnalyzeResumeRequest(BaseModel):
    resume_text: str

class ResumeAnalysisResponse(BaseModel):
    candidate_name: str = "Candidate"
    summary: str
    skills: List[str] = []
    projects: List[Dict[str, Any]] = []
    experience_years: float = 0.0
    strengths: List[str] = []

class AnalyzeJDRequest(BaseModel):
    jd_text: str
    resume_text: Optional[str] = ""

class JDAnalysisResponse(BaseModel):
    role_title: str = "Target Role"
    required_skills: List[str] = []
    skill_gaps: List[str] = []
    fit_score: float = 80.0
    key_focus_areas: List[str] = []

# --- Question Generation Models ---

class GenerateCodingRequest(BaseModel):
    language: str
    resume_context: Optional[str] = ""


class CodingTemplate(BaseModel):
    language: str = "javascript"
    starter_code: str = ""
    problem_statement: str = ""
    test_cases: List[Dict[str, Any]] = []

class QuestionItem(BaseModel):
    id: int
    type: str  # "resume", "technical", "coding", "behavioral", "jd_specific"
    difficulty: str  # "easy", "medium", "hard"
    category: str
    question: str
    context: Optional[str] = ""
    coding_template: Optional[CodingTemplate] = None

class GenerateQuestionsRequest(BaseModel):
    resume_text: str
    jd_text: Optional[str] = ""

class GenerateQuestionsResponse(BaseModel):
    questions: List[QuestionItem]
    total_count: int

# --- Dynamic Follow-up Models ---

class FollowUpRequest(BaseModel):
    question: str
    candidateAnswer: Optional[str] = None
    user_answer: Optional[str] = None
    evaluation: Optional[Dict[str, Any]] = None
    context: Optional[str] = ""

    def get_candidate_answer(self) -> str:
        return self.candidateAnswer or self.user_answer or ""

class FollowUpResponse(BaseModel):
    needs_follow_up: bool = True
    follow_up_question: Optional[str] = None
    followUpQuestion: Optional[str] = None
    difficulty: str = "medium"
    isFollowUp: bool = True

# --- Answer Evaluation Models ---

class EvaluateAnswerRequest(BaseModel):
    question_id: Optional[int] = 1
    question_text: Optional[str] = None
    question: Optional[str] = None
    question_type: Optional[str] = "technical"
    difficulty: Optional[str] = "medium"
    user_answer: Optional[str] = None
    candidateAnswer: Optional[str] = None
    candidate_resume_context: Optional[str] = ""
    resumeContext: Optional[str] = ""

    def get_question_text(self) -> str:
        return self.question or self.question_text or ""

    def get_user_answer(self) -> str:
        return self.candidateAnswer or self.user_answer or ""

    def get_resume_context(self) -> str:
        return self.resumeContext or self.candidate_resume_context or ""

class EvaluateAnswerResponse(BaseModel):
    # Core scoring fields — all scored 0-100 by Gemini
    score: float = 0.0
    correctness: float = 0.0
    completeness: float = 0.0
    depth: float = 0.0
    communication_score: float = 0.0
    # Text fields
    ideal_answer: str = ""
    feedback: str = ""
    # List fields
    strengths: List[str] = []
    areas_for_improvement: List[str] = []
    # Sakshi's module additions
    technical_score: float = 0.0
    behavioral_score: Optional[float] = None
    is_behavioral: bool = False

# --- Coding Evaluation Models ---

class ExecuteCodeRequest(BaseModel):
    problem_statement: str
    code: str
    language: str
    test_cases: List[Dict[str, Any]] = []

class TestCaseResult(BaseModel):
    input: str
    expected_output: str
    actual_output: str
    passed: bool
    error: Optional[str] = None

class ExecuteCodeResponse(BaseModel):
    status: str
    results: List[TestCaseResult] = []
    passed_count: int = 0
    total_count: int = 0
    raw_output: str = ""

class ReviewCodeRequest(BaseModel):
    problem_statement: str
    code: str
    language: str
    test_cases: List[Dict[str, Any]] = []
    execution_results: Optional[Dict[str, Any]] = None

class ReviewCodeResponse(BaseModel):
    score: float
    correctness: float
    code_quality: float
    time_complexity: str
    space_complexity: str
    test_case_results: List[Dict[str, Any]] = []
    suggestions: List[str] = []
    optimized_code: str

# --- Final Report Models ---

class FinalReportRequest(BaseModel):
    candidate_info: Optional[Dict[str, Any]] = {}
    candidateInfo: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None
    sessionId: Optional[str] = None
    questions_and_evaluations: List[Dict[str, Any]] = []
    questionsAndEvaluations: Optional[List[Dict[str, Any]]] = None
    coding_evaluations: List[Dict[str, Any]] = []
    codingEvaluations: Optional[List[Dict[str, Any]]] = None
    face_missing_count: int = 0
    faceMissingCount: Optional[int] = None


class FinalReportResponse(BaseModel):
    overall_score: float
    technical_accuracy_score: float
    coding_score: float
    communication_score: float
    behavioral_score: float
    project_score: float
    strengths: List[str] = []
    weaknesses: List[str] = []
    key_takeaways: List[str] = []
    ideal_answers: List[Dict[str, Any]] = []
    learning_roadmap: List[str] = []
    face_missing_count: int = 0
    summary: str
    # --- Sakshi's module: Overall Rating & Personalized Feedback ---
    personalized_suggestions: List[str] = []  # Feature 24: candidate-specific advice tied to resume/skill gaps

# --- TTS Models ---

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = "en-US-ChristopherNeural"
