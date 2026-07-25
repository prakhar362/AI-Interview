"""
evaluation_service.py
---------------------
Sakshi's module: AI Evaluation & Final Report

Responsibilities:
- Build Gemini prompts for per-question answer evaluation
- Call gemini_service (the shared Gemini wrapper)
- Post-process the raw Gemini response dict to ensure all schema fields
  are present and have safe values before returning to the router
- Keep all business logic OUT of the router

The router (evaluation.py) is a thin controller that only:
  1. Validates the incoming request (Pydantic)
  2. Delegates to this service
  3. Returns the response or raises HTTPException
"""

import logging
from typing import Any, Dict, List, Optional

from app.services.gemini_service import gemini_service
from app.prompts.answer_evaluation import ANSWER_EVALUATION_SYSTEM_PROMPT
from app.prompts.final_report import FINAL_REPORT_SYSTEM_PROMPT

logger = logging.getLogger("evaluation_service")

# ---------------------------------------------------------------------------
# Category weights for overall_score calculation.
#
# Keys match FinalReportResponse field names exactly.
# Defined as a module-level constant so weights can be changed in one place
# without touching any aggregation logic (Adjustment 1).
#
# These weights apply only when a category is present (non-None score).
# Missing categories are excluded and remaining weights are re-normalized,
# so candidates are not penalized for session structures that omit a category
# (Adjustment 3).
# ---------------------------------------------------------------------------
SCORE_WEIGHTS: Dict[str, float] = {
    "technical_accuracy_score": 0.30,
    "communication_score":      0.20,
    "behavioral_score":         0.20,
    "coding_score":             0.20,
    "project_score":            0.10,
}


class EvaluationService:
    """
    Service class for all AI evaluation logic.
    Covers Features 18-24 of Sakshi's module.
    """

    # ==================================================================
    # Feature 18: AI Answer Refactoring
    # Feature 19: Technical Accuracy Scoring
    # Feature 20: Communication Scoring
    # Feature 22: Behavioral & HR Evaluation
    # ==================================================================

    async def evaluate_answer(
        self,
        question_id: int,
        question_text: str,
        question_type: str,
        difficulty: str,
        user_answer: str,
        candidate_resume_context: str = "",
    ) -> Dict[str, Any]:
        """
        Performs a single Gemini call that evaluates all dimensions of a
        candidate's spoken answer in one request.

        Returns a dict whose keys map directly to EvaluateAnswerResponse fields.
        """
        prompt = self._build_evaluation_prompt(
            question_id=question_id,
            question_text=question_text,
            question_type=question_type,
            difficulty=difficulty,
            user_answer=user_answer,
            candidate_resume_context=candidate_resume_context,
        )

        raw: Dict[str, Any] = await gemini_service.generate_json(
            prompt, ANSWER_EVALUATION_SYSTEM_PROMPT
        )

        return self._sanitise_evaluation_response(raw)

    # ------------------------------------------------------------------
    # evaluate_answer private helpers
    # ------------------------------------------------------------------

    def _build_evaluation_prompt(
        self,
        question_id: int,
        question_text: str,
        question_type: str,
        difficulty: str,
        user_answer: str,
        candidate_resume_context: str,
    ) -> str:
        """
        Constructs the user-facing portion of the Gemini prompt.

        Providing question_type and difficulty explicitly lets Gemini
        calibrate scoring expectations correctly:
        - A 'hard' technical question is scored differently from an 'easy' one.
        - A 'behavioral' type question triggers is_behavioral=true in the response.
        """
        resume_section = (
            f"\nCandidate Resume Background (for context):\n{candidate_resume_context}"
            if candidate_resume_context and candidate_resume_context.strip()
            else "\nCandidate Resume Background: Not provided."
        )

        return (
            f"Question ID: {question_id}\n"
            f"Question Type: {question_type}\n"
            f"Difficulty: {difficulty}\n\n"
            f"Question:\n{question_text}\n\n"
            f"Candidate's Answer:\n{user_answer}"
            f"{resume_section}"
        )

    def _sanitise_evaluation_response(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Applies safe defaults to any field Gemini may have omitted or
        returned with the wrong type.

        This protects EvaluateAnswerResponse(**data) in the router from
        raising a Pydantic ValidationError due to a partial Gemini response.

        Defensive rules applied:
        - Booleans: parsed explicitly to handle string variants ("true"/"false")
          that Gemini occasionally returns instead of JSON booleans.
        - Numerics: guarded with an explicit None check so that null/None from
          Gemini never reaches float() as None, which would raise a TypeError.
        - Strings: None is converted to "" rather than the literal string "None"
          that str(None) would produce.
        - Lists: None or non-list values fall back to [] rather than crashing
          inside list(None).
        """

        def safe_bool(val: Any, default: bool = False) -> bool:
            if isinstance(val, bool):
                return val
            if isinstance(val, int):
                return val != 0
            if isinstance(val, str):
                return val.strip().lower() == "true"
            return default

        def safe_float(val: Any, default: float = 0.0) -> float:
            if val is None:
                return default
            try:
                return float(val)
            except (ValueError, TypeError):
                return default

        def safe_str(val: Any, default: str = "") -> str:
            if val is None:
                return default
            return str(val)

        def safe_list(val: Any) -> list:
            if isinstance(val, list):
                return val
            return []

        is_behavioral = safe_bool(raw.get("is_behavioral"), default=False)

        technical_score = safe_float(
            raw.get("technical_score"),
            default=safe_float(raw.get("correctness"), default=0.0),
        )

        raw_behavioral = raw.get("behavioral_score")
        if is_behavioral and raw_behavioral is not None:
            behavioral_score = safe_float(raw_behavioral, default=0.0)
        else:
            behavioral_score = None

        return {
            # Existing fields (backward compatible)
            "score":                 safe_float(raw.get("score")),
            "correctness":           safe_float(raw.get("correctness")),
            "completeness":          safe_float(raw.get("completeness")),
            "depth":                 safe_float(raw.get("depth")),
            "communication_score":   safe_float(raw.get("communication_score")),
            "ideal_answer":          safe_str(raw.get("ideal_answer")),
            "feedback":              safe_str(raw.get("feedback")),
            "strengths":             safe_list(raw.get("strengths")),
            "areas_for_improvement": safe_list(raw.get("areas_for_improvement")),
            # New fields (Sakshi's module)
            "technical_score":       technical_score,
            "is_behavioral":         is_behavioral,
            "behavioral_score":      behavioral_score,
        }

    # ==================================================================
    # Feature 23: Strength & Weakness Analysis
    # Feature 24: Overall Rating & Personalized Feedback
    # ==================================================================

    async def generate_final_report(
        self,
        candidate_info: Dict[str, Any],
        session_id: str,
        questions_and_evaluations: List[Dict[str, Any]],
        coding_evaluations: List[Dict[str, Any]],
        face_missing_count: int,
    ) -> Dict[str, Any]:
        """
        Generates the complete final interview report.

        Architecture:
          Step 1 - Compute all numeric scores deterministically in Python.
                   No Gemini involvement. Reproducible, consistent results.
          Step 2 - Build a condensed prompt giving Gemini the pre-computed
                   scores + interview summary as context.
          Step 3 - Single Gemini call for qualitative fields only:
                   strengths, weaknesses, key_takeaways, learning_roadmap,
                   personalized_suggestions, summary.
          Step 4 - Merge computed scores + Gemini qualitative fields.
                   Apply safe defaults. Pin face_missing_count and ideal_answers.

        Returns a dict whose keys map directly to FinalReportResponse fields.
        """
        # Step 1: deterministic score computation
        computed = self._compute_scores(
            questions_and_evaluations=questions_and_evaluations,
            coding_evaluations=coding_evaluations,
        )

        # Step 2: build prompt
        prompt = self._build_final_report_prompt(
            candidate_info=candidate_info,
            computed=computed,
            questions_and_evaluations=questions_and_evaluations,
            coding_evaluations=coding_evaluations,
            face_missing_count=face_missing_count,
        )

        # Step 3: single Gemini call — qualitative fields only
        try:
            raw: Dict[str, Any] = await gemini_service.generate_json(
                prompt, FINAL_REPORT_SYSTEM_PROMPT
            )
        except Exception as e:
            logger.error(f"Gemini final report generation failed: {e}. Falling back to deterministic qualitative report.")
            raw = {
                "strengths": [
                    "Successfully completed the full interactive AI mock interview session.",
                    "Demonstrated commitment to technical practice and career preparation."
                ],
                "weaknesses": [
                    "Review questions where technical depth or specific terminology was missing.",
                    "Focus on expanding concise answers with concrete examples."
                ],
                "key_takeaways": [
                    "Interview session fully recorded and evaluated.",
                    "Category scores calculated deterministically from candidate responses."
                ],
                "learning_roadmap": [
                    "Review fundamental data structures, algorithms, and system design concepts.",
                    "Practice the STAR framework (Situation, Task, Action, Result) for behavioral questions.",
                    "Conduct follow-up mock interview sessions to track performance growth."
                ],
                "personalized_suggestions": [
                    "Connect your technical background directly to real-world project impact during answers.",
                    "Practice explaining trade-offs before settling on a specific technical approach."
                ],
                "summary": f"The candidate completed the mock interview session with an overall performance score of {computed.get('overall_score', 0)}%."
            }

        # Step 4: merge and sanitise
        return self._build_final_report_response(
            raw=raw,
            computed=computed,
            face_missing_count=face_missing_count,
        )

    # ------------------------------------------------------------------
    # generate_final_report private helpers
    # ------------------------------------------------------------------

    def _compute_scores(
        self,
        questions_and_evaluations: List[Dict[str, Any]],
        coding_evaluations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Computes all numeric category scores deterministically from the
        per-question evaluation data. No Gemini involved.

        Scoring philosophy:
        - Category score = (sum of answered scores) / (total questions in that category)
        - Unanswered questions are treated as 0/100, not excluded
        - This means answering 4 out of 19 questions partially = very low overall score
        - A candidate must answer most questions well to score high

        Returns a dict with:
          technical_accuracy_score  float or None
          communication_score       float or None
          behavioral_score          float or None  (None = not assessed)
          coding_score              float or None  (None = no coding questions)
          project_score             float or None  (None = no resume questions)
          overall_score             float          (always present)
          ideal_answers             List[dict]
        """
        # Track both scores AND total question counts per category
        technical_scores: List[float] = []
        communication_scores: List[float] = []
        behavioral_scores: List[float] = []
        project_scores: List[float] = []
        ideal_answers: List[Dict[str, Any]] = []

        # Count total questions per category (including unanswered ones)
        # so we can penalize for not answering
        total_technical = 0
        total_communication = 0
        total_behavioral = 0
        total_project = 0

        for item in questions_and_evaluations:
            if not isinstance(item, dict):
                continue
            evaluation = item.get("evaluation")
            if not isinstance(evaluation, dict):
                evaluation = item
            q_type = str(item.get("type", "")).lower()
            has_evaluation = bool(evaluation)

            is_beh = evaluation.get("is_behavioral", False)
            if isinstance(is_beh, str):
                is_beh = is_beh.strip().lower() == "true"

            # Count this question toward its category total
            # Every spoken question contributes to technical + communication totals
            total_technical += 1
            total_communication += 1

            if is_beh:
                total_behavioral += 1

            if q_type == "resume":
                total_project += 1

            # Only add actual scores if the question was answered
            if has_evaluation:
                # technical_score
                ts = evaluation.get("technical_score")
                if ts is not None:
                    try:
                        technical_scores.append(float(ts))
                    except (ValueError, TypeError):
                        pass

                # communication_score
                cs = evaluation.get("communication_score")
                if cs is not None:
                    try:
                        communication_scores.append(float(cs))
                    except (ValueError, TypeError):
                        pass

                # behavioral_score — only behavioral questions
                if is_beh:
                    bs = evaluation.get("behavioral_score")
                    if bs is not None:
                        try:
                            behavioral_scores.append(float(bs))
                        except (ValueError, TypeError):
                            pass

                # project_score — resume-type questions only
                if q_type == "resume":
                    ps = evaluation.get("score")
                    if ps is not None:
                        try:
                            project_scores.append(float(ps))
                        except (ValueError, TypeError):
                            pass

            # Assemble ideal_answers from per-question evaluation data
            ideal = evaluation.get("ideal_answer", "")
            question_text = item.get("question", "")
            user_ans = item.get("userAnswer", "")
            if question_text and ideal:
                ideal_answers.append({
                    "question":     question_text,
                    "user_answer":  user_ans,
                    "ideal_answer": ideal,
                })

        # coding_score: from coding_evaluations review scores
        coding_scores: List[float] = []
        total_coding = 0
        for item in coding_evaluations:
            total_coding += 1
            review = item.get("review") or {}
            score = review.get("score")
            if score is not None:
                try:
                    coding_scores.append(float(score))
                except (ValueError, TypeError):
                    pass

        def weighted_mean(scores: List[float], total: int) -> Optional[float]:
            """
            Score = sum(answered scores) / total_questions_in_category
            Unanswered questions implicitly contribute 0.
            Returns None if there were no questions in this category at all.
            """
            if total == 0:
                return None
            return round(sum(scores) / total, 2)

        def mean_or_none(values: List[float]) -> Optional[float]:
            """Arithmetic mean rounded to 2dp, or None if list is empty."""
            return round(sum(values) / len(values), 2) if values else None

        category_scores: Dict[str, Optional[float]] = {
            "technical_accuracy_score": weighted_mean(technical_scores,    total_technical),
            "communication_score":      weighted_mean(communication_scores, total_communication),
            "behavioral_score":         weighted_mean(behavioral_scores,    total_behavioral),
            "coding_score":             weighted_mean(coding_scores,        total_coding),
            "project_score":            weighted_mean(project_scores,       total_project),
        }

        # Adjustment 3: normalize weights across present categories only.
        # This ensures a session without coding or behavioral questions does
        # not penalize the candidate with implicit 0.0 contributions.
        present = {k: v for k, v in category_scores.items() if v is not None}

        if present:
            active_weight_sum = sum(SCORE_WEIGHTS[k] for k in present)
            overall_score = round(
                sum(
                    v * (SCORE_WEIGHTS[k] / active_weight_sum)
                    for k, v in present.items()
                ),
                2,
            )
        else:
            # Absolute fallback: no evaluations at all in this session
            overall_score = 0.0

        return {
            **category_scores,
            "overall_score": overall_score,
            "ideal_answers": ideal_answers,
        }

    def _build_final_report_prompt(
        self,
        candidate_info: Dict[str, Any],
        computed: Dict[str, Any],
        questions_and_evaluations: List[Dict[str, Any]],
        coding_evaluations: List[Dict[str, Any]],
        face_missing_count: int,
    ) -> str:
        """
        Builds the user prompt for the final report Gemini call.

        Gemini receives:
        - Candidate background from resume analysis
        - Pre-computed numeric scores as read-only context
        - A condensed Q&A performance summary
        - Face missing count

        Gemini is told NOT to recalculate scores — its job is qualitative
        synthesis only. The prompt stays focused and within token limits
        by sending a condensed summary rather than full evaluation dicts.
        """
        # Condensed spoken Q&A summary
        qa_lines = []
        for i, item in enumerate(questions_and_evaluations, 1):
            evaluation = item.get("evaluation") or {}
            q_type = item.get("type", "unknown")
            question = item.get("question", "")
            score = evaluation.get("score", 0)
            is_beh = evaluation.get("is_behavioral", False)
            if isinstance(is_beh, str):
                is_beh = is_beh.strip().lower() == "true"
            beh_label = " [BEHAVIORAL]" if is_beh else ""
            gaps = evaluation.get("areas_for_improvement", [])
            gaps_str = "; ".join(gaps[:2]) if gaps else "none noted"
            qa_lines.append(
                f"  Q{i} [{q_type}{beh_label}] score={score}/100: "
                f"{question[:80]}\n     Key gaps: {gaps_str}"
            )

        # Condensed coding summary
        coding_lines = []
        for i, item in enumerate(coding_evaluations, 1):
            review = item.get("review") or {}
            question = item.get("question", "")
            score = review.get("score", 0)
            suggestions = review.get("suggestions", [])
            sug_str = "; ".join(suggestions[:2]) if suggestions else "none"
            coding_lines.append(
                f"  C{i} score={score}/100: {question[:80]}"
                f"\n     Suggestions: {sug_str}"
            )

        qa_block = "\n".join(qa_lines) or "  No spoken questions recorded."
        coding_block = "\n".join(coding_lines) or "  No coding questions recorded."

        def fmt_score(val: Optional[float]) -> str:
            return f"{val}/100" if val is not None else "N/A (not assessed this session)"

        scores_block = (
            f"  Overall Score:            {computed['overall_score']}/100\n"
            f"  Technical Accuracy:       {fmt_score(computed['technical_accuracy_score'])}\n"
            f"  Communication:            {fmt_score(computed['communication_score'])}\n"
            f"  Behavioral (STAR):        {fmt_score(computed['behavioral_score'])}\n"
            f"  Coding:                   {fmt_score(computed['coding_score'])}\n"
            f"  Project/Resume Deep-dive: {fmt_score(computed['project_score'])}"
        )

        candidate_name = candidate_info.get("candidate_name", "Candidate")
        skills = ", ".join(candidate_info.get("skills", [])) or "Not specified"
        exp = candidate_info.get("experience_years", "Unknown")
        bg = candidate_info.get("summary", "Not provided")

        return (
            f"CANDIDATE PROFILE\n"
            f"  Name: {candidate_name}\n"
            f"  Experience: {exp} years\n"
            f"  Skills: {skills}\n"
            f"  Background: {bg}\n\n"
            f"COMPUTED PERFORMANCE SCORES (read-only — do not recalculate)\n"
            f"{scores_block}\n\n"
            f"PROCTORING NOTE\n"
            f"  Face absent from webcam: {face_missing_count} time(s)\n\n"
            f"SPOKEN QUESTION PERFORMANCE SUMMARY\n"
            f"{qa_block}\n\n"
            f"CODING QUESTION PERFORMANCE SUMMARY\n"
            f"{coding_block}\n\n"
            f"Using the above context, generate the qualitative evaluation fields "
            f"(strengths, weaknesses, key_takeaways, learning_roadmap, "
            f"personalized_suggestions, summary) as specified in your instructions."
        )

    def _build_final_report_response(
        self,
        raw: Dict[str, Any],
        computed: Dict[str, Any],
        face_missing_count: int,
    ) -> Dict[str, Any]:
        """
        Merges deterministic computed scores with Gemini's qualitative output.

        Rules:
        - All numeric scores come exclusively from `computed`.
          Gemini's dict is never used for scores even if Gemini incorrectly
          returns numeric fields.
        - None category scores are converted to 0.0 for schema compliance.
          FinalReportResponse declares category scores as float (not Optional).
          This conversion is safe because overall_score was already computed
          correctly using only non-None values before this point.
        - ideal_answers and face_missing_count are pinned from computed/request.
        - Qualitative fields use safe defaults if Gemini omits them.
        """
        def safe_list(val: Any) -> list:
            return val if isinstance(val, list) else []

        def safe_str(val: Any) -> str:
            return str(val) if val is not None else ""

        def score_or_zero(key: str) -> float:
            val = computed.get(key)
            return float(val) if val is not None else 0.0

        return {
            # Numeric scores: Python only, never from Gemini
            "overall_score":            float(computed["overall_score"]),
            "technical_accuracy_score": score_or_zero("technical_accuracy_score"),
            "communication_score":      score_or_zero("communication_score"),
            "behavioral_score":         score_or_zero("behavioral_score"),
            "coding_score":             score_or_zero("coding_score"),
            "project_score":            score_or_zero("project_score"),
            # Passthrough: pinned from request / computed data
            "face_missing_count":       face_missing_count,
            "ideal_answers":            computed.get("ideal_answers", []),
            # Qualitative: from Gemini with safe defaults
            "strengths":                safe_list(raw.get("strengths")),
            "weaknesses":               safe_list(raw.get("weaknesses")),
            "key_takeaways":            safe_list(raw.get("key_takeaways")),
            "learning_roadmap":         safe_list(raw.get("learning_roadmap")),
            "personalized_suggestions": safe_list(raw.get("personalized_suggestions")),
            "summary":                  safe_str(raw.get("summary")),
        }


# Module-level singleton — mirrors the pattern used by gemini_service,
# pdf_service, tts_service, and code_execution_service in this project.
evaluation_service = EvaluationService()
