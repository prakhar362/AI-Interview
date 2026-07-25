# AI Evaluation & Final Report Module

**Owner:** Sakshi  
**Project:** AI Interview Simulator  
**Stack:** FastAPI · Python · Gemini API  
**Last updated:** July 2026

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Features Implemented](#2-features-implemented)
3. [Folder Structure](#3-folder-structure)
4. [Files Owned & Modified](#4-files-owned--modified)
5. [Endpoints](#5-endpoints)
6. [Request & Response Models](#6-request--response-models)
7. [Request Flow Diagrams](#7-request-flow-diagrams)
8. [EvaluationService Architecture](#8-evaluationservice-architecture)
9. [Router Responsibilities](#9-router-responsibilities)
10. [Prompt Responsibilities](#10-prompt-responsibilities)
11. [Gemini vs Python Responsibilities](#11-gemini-vs-python-responsibilities)
12. [Score Computation & Weight Normalization](#12-score-computation--weight-normalization)
13. [Sanitisation Strategy](#13-sanitisation-strategy)
14. [Integration with Teammate Modules](#14-integration-with-teammate-modules)
15. [Error Handling](#15-error-handling)
16. [Design Decisions](#16-design-decisions)
17. [Current Limitations & Future Enhancements](#17-current-limitations--future-enhancements)
18. [Extension Guide](#18-extension-guide)

---

## 1. Module Overview

This module implements the AI evaluation pipeline for the AI Interview Simulator.
It is responsible for two backend endpoints:

| Endpoint | Trigger | Purpose |
|---|---|---|
| `POST /api/evaluate-answer` | After each spoken answer | Per-question AI evaluation |
| `POST /api/final-report` | After the last question | Full session report synthesis |

The module is **stateless**. No database, no server-side session. All data
arrives from the frontend per request and is returned in a single HTTP response.

---

## 2. Features Implemented

| # | Feature | Endpoint | Description |
|---|---|---|---|
| 18 | AI Answer Refactoring | `/api/evaluate-answer` | Generates a complete model answer for every question |
| 19 | Technical Accuracy Scoring | `/api/evaluate-answer` | Dedicated 0–100 technical accuracy score |
| 20 | Communication Scoring | `/api/evaluate-answer` | Scores clarity, grammar, structure, and confidence |
| 22 | Behavioral & HR Evaluation | `/api/evaluate-answer` | STAR framework scoring for behavioral questions |
| 23 | Strength & Weakness Analysis | `/api/final-report` | Synthesizes strengths and weaknesses across all answers |
| 24 | Overall Rating & Personalized Feedback | `/api/final-report` | Weighted score, narrative summary, learning roadmap, personalized suggestions |

---

## 3. Folder Structure

Only the files relevant to this module are shown.

```
backend/
└── app/
    ├── models/
    │   └── schemas.py                ← MODIFIED (3 + 1 fields added, see Section 4)
    ├── prompts/
    │   ├── answer_evaluation.py      ← OWNED
    │   └── final_report.py           ← OWNED
    ├── routers/
    │   └── evaluation.py             ← OWNED
    └── services/
        ├── evaluation_service.py     ← OWNED (created by this module)
        └── gemini_service.py         ← SHARED, read-only (not modified)
```

---

## 4. Files Owned & Modified

### Owned files (exclusively maintained by this module)

| File | Role |
|---|---|
| `app/routers/evaluation.py` | Thin HTTP controller for both endpoints |
| `app/services/evaluation_service.py` | All business logic, score computation, prompt building |
| `app/prompts/answer_evaluation.py` | `ANSWER_EVALUATION_SYSTEM_PROMPT` constant |
| `app/prompts/final_report.py` | `FINAL_REPORT_SYSTEM_PROMPT` constant |

> **Note:** `app/prompts/answer_evaluation.py` also contains
> `FOLLOW_UP_SYSTEM_PROMPT`, which is owned by the interview module
> teammate. That constant must not be modified by this module.

### Modified shared file

**`app/models/schemas.py`** — three fields added to `EvaluateAnswerResponse`,
one field added to `FinalReportResponse`. All additions use safe defaults.
No existing field was renamed, removed, or changed in type.

**Fields added to `EvaluateAnswerResponse`:**

```python
technical_score: float = 0.0
# Feature 19: dedicated technical accuracy score (0–100)
# Falls back to `correctness` if Gemini omits it.

behavioral_score: Optional[float] = None
# Feature 22: STAR adherence score (0–100), or None for non-behavioral questions.
# None is semantically correct — it means "not applicable", not "zero".

is_behavioral: bool = False
# Feature 22: True when Gemini determines the question is behavioral/HR.
# Used to gate behavioral_score aggregation in the final report.
```

**Field added to `FinalReportResponse`:**

```python
personalized_suggestions: List[str] = []
# Feature 24: candidate-specific improvement suggestions tied to resume background.
# Default [] ensures existing saved sessions deserialize without error.
```

---

## 5. Endpoints

### `POST /api/evaluate-answer`

Evaluates a single spoken answer. Called once per question during the interview.
Returns a fully structured evaluation in a **single Gemini call**.

Covers Features 18, 19, 20, 22.

### `POST /api/final-report`

Generates the complete session report after the interview ends.
Numeric scores are computed deterministically in Python.
Qualitative fields are synthesized in a **single Gemini call**.

Covers Features 23, 24.

---

## 6. Request & Response Models

### `POST /api/evaluate-answer`

**Request — `EvaluateAnswerRequest`**

| Field | Type | Required | Notes |
|---|---|---|---|
| `question_id` | `int` | Yes | Unique question identifier |
| `question_text` | `str` | Yes | Full question text |
| `question_type` | `str` | Yes | `"resume"` `"technical"` `"behavioral"` `"coding"` `"jd_specific"` |
| `difficulty` | `str` | Yes | `"easy"` `"medium"` `"hard"` |
| `user_answer` | `str` | Yes | Candidate's spoken answer |
| `candidate_resume_context` | `str` | No | Extracted resume text; omitted from prompt if empty |

**Response — `EvaluateAnswerResponse`**

| Field | Type | Default | Source | Notes |
|---|---|---|---|---|
| `score` | `float` | — | Gemini | Overall 0–100. Pre-existing. |
| `correctness` | `float` | — | Gemini | Factual/technical correctness 0–100. Pre-existing. |
| `completeness` | `float` | — | Gemini | Answer coverage 0–100. Pre-existing. |
| `depth` | `float` | — | Gemini | Depth of insight 0–100. Pre-existing. |
| `communication_score` | `float` | — | Gemini | Clarity/grammar/structure/confidence 0–100. Pre-existing. |
| `ideal_answer` | `str` | — | Gemini | Complete model answer. Feature 18. Pre-existing. |
| `feedback` | `str` | — | Gemini | Constructive per-question critique. Pre-existing. |
| `strengths` | `list[str]` | `[]` | Gemini | Per-question positives. Pre-existing. |
| `areas_for_improvement` | `list[str]` | `[]` | Gemini | Per-question gaps. Pre-existing. |
| `technical_score` | `float` | `0.0` | Gemini | Dedicated technical accuracy. Feature 19. **Added.** |
| `behavioral_score` | `float?` | `None` | Gemini | STAR score 0–100, or `null`. Feature 22. **Added.** |
| `is_behavioral` | `bool` | `False` | Gemini | True for HR/behavioral questions. Feature 22. **Added.** |

---

### `POST /api/final-report`

**Request — `FinalReportRequest`**

| Field | Type | Notes |
|---|---|---|
| `candidate_info` | `dict` | `ResumeAnalysisResponse` fields (name, skills, experience, summary) |
| `session_id` | `str` | Client-generated session identifier |
| `questions_and_evaluations` | `list[dict]` | Spoken answers, each with nested `evaluation` (`EvaluateAnswerResponse`) |
| `coding_evaluations` | `list[dict]` | Coding submissions, each with nested `review` (`ReviewCodeResponse`) |
| `face_missing_count` | `int` | Proctoring count from WebcamMonitor |

**Response — `FinalReportResponse`**

| Field | Type | Default | Source | Notes |
|---|---|---|---|---|
| `overall_score` | `float` | — | Python | Normalized weighted average. Pre-existing. |
| `technical_accuracy_score` | `float` | `0.0` | Python | Mean of `eval.technical_score`. Pre-existing. |
| `coding_score` | `float` | `0.0` | Python | Mean of `review.score`. Pre-existing. |
| `communication_score` | `float` | `0.0` | Python | Mean of `eval.communication_score`. Pre-existing. |
| `behavioral_score` | `float` | `0.0` | Python | Mean of behavioral evals. Pre-existing. |
| `project_score` | `float` | `0.0` | Python | Mean of resume-type question scores. Pre-existing. |
| `strengths` | `list[str]` | `[]` | Gemini | Synthesized across session. Feature 23. Pre-existing. |
| `weaknesses` | `list[str]` | `[]` | Gemini | Synthesized across session. Feature 23. Pre-existing. |
| `key_takeaways` | `list[str]` | `[]` | Gemini | High-level hiring observations. Pre-existing. |
| `ideal_answers` | `list[dict]` | `[]` | Python | `[{question, user_answer, ideal_answer}]`. Pre-existing. |
| `learning_roadmap` | `list[str]` | `[]` | Gemini | Ordered actionable steps. Feature 24. Pre-existing. |
| `summary` | `str` | — | Gemini | Executive narrative. Feature 24. Pre-existing. |
| `face_missing_count` | `int` | `0` | Passthrough | Pinned from request. Pre-existing. |
| `personalized_suggestions` | `list[str]` | `[]` | Gemini | Resume-tied suggestions. Feature 24. **Added.** |

> **Backward compatibility:** All pre-existing fields are preserved with
> identical names and types. Added fields use safe defaults. No existing
> frontend consumer requires any changes.

---

## 7. Request Flow Diagrams

### `/api/evaluate-answer` — full request flow

```
Frontend (InterviewPage.jsx)
  │  Candidate finishes speaking
  │  POST /api/evaluate-answer
  │  { question_id, question_text, question_type,
  │    difficulty, user_answer, candidate_resume_context }
  ▼
Router (evaluation.py)
  │  Pydantic validates EvaluateAnswerRequest
  │  calls evaluation_service.evaluate_answer(...)
  ▼
EvaluationService._build_evaluation_prompt()
  │  Assembles: question metadata + answer + resume context
  │  Resume section omitted if empty
  ▼
gemini_service.generate_json(user_prompt, ANSWER_EVALUATION_SYSTEM_PROMPT)
  │  ← SINGLE GEMINI CALL
  │  Returns raw dict with 12 fields
  ▼
EvaluationService._sanitise_evaluation_response(raw)
  │  safe_bool()   → is_behavioral
  │  safe_float()  → all numeric scores
  │  safe_str()    → ideal_answer, feedback
  │  safe_list()   → strengths, areas_for_improvement
  │  fallback chain → technical_score → correctness → 0.0
  │  behavioral gate → behavioral_score = None if not behavioral
  ▼
Router returns EvaluateAnswerResponse(**result)
  ▼
Frontend stores in answers[] as:
  { questionId, question, type, difficulty, userAnswer,
    evaluation: <EvaluateAnswerResponse> }
  Forwarded as questions_and_evaluations[] to /api/final-report
```

---

### `/api/final-report` — full request flow

```
Frontend (InterviewPage.jsx — after last question)
  │  POST /api/final-report
  │  { candidate_info, session_id, face_missing_count,
  │    questions_and_evaluations[], coding_evaluations[] }
  ▼
Router (evaluation.py)
  │  Pydantic validates FinalReportRequest
  │  calls evaluation_service.generate_final_report(...)
  ▼
STEP 1 — EvaluationService._compute_scores()   ← PURE PYTHON, no Gemini
  │  questions_and_evaluations[]:
  │    eval.technical_score         → technical_accuracy_score
  │    eval.communication_score     → communication_score
  │    eval.behavioral_score        → behavioral_score
  │      (only where is_behavioral == True)
  │    eval.score                   → project_score
  │      (only where item.type == "resume")
  │    eval.ideal_answer            → ideal_answers[] assembled
  │  coding_evaluations[]:
  │    review.score                 → coding_score
  │  mean_or_none() each category
  │  normalized weighted mean       → overall_score
  ▼
STEP 2 — EvaluationService._build_final_report_prompt()
  │  Formats: candidate profile + computed scores (read-only)
  │           + condensed Q&A summary + condensed coding summary
  │  Gemini instructed: synthesize qualitative fields only
  ▼
STEP 3 — gemini_service.generate_json(prompt, FINAL_REPORT_SYSTEM_PROMPT)
  │  ← SINGLE GEMINI CALL
  │  Returns 6 qualitative fields only:
  │  strengths, weaknesses, key_takeaways,
  │  learning_roadmap, personalized_suggestions, summary
  ▼
STEP 4 — EvaluationService._build_final_report_response(raw, computed)
  │  numeric scores  ← computed only (Gemini values ignored)
  │  None scores     → 0.0 for schema compliance
  │  ideal_answers   ← computed (assembled in Step 1)
  │  face_missing    ← pinned from original request
  │  qualitative     ← Gemini output with safe_list/safe_str defaults
  ▼
Router returns FinalReportResponse(**result)
  ▼
Frontend navigates to ReportPage
  ReportSummary renders: score banner, summary, strengths, weaknesses,
                          learning_roadmap, ideal_answers
  ScoreCharts renders:   radar + bar charts for all 5 category scores
  Session saved to localStorage
```

---

### Sequence Diagrams

**`/api/evaluate-answer`**
```
Frontend      Router        EvaluationService     Gemini
   │             │                 │                  │
   │──POST──────►│                 │                  │
   │             │─evaluate()─────►│                  │
   │             │                 │──generate_json()─►│
   │             │                 │◄──raw dict (12)───│
   │             │                 │─_sanitise()        │
   │             │◄─sanitised dict─│                  │
   │◄──HTTP 200──│                 │                  │
```

**`/api/final-report`**
```
Frontend      Router        EvaluationService     Gemini
   │             │                 │                  │
   │──POST──────►│                 │                  │
   │             │─generate_rpt()─►│                  │
   │             │                 │─_compute_scores() │
   │             │                 │  (pure Python)    │
   │             │                 │─_build_prompt()   │
   │             │                 │──generate_json()─►│
   │             │                 │◄──raw dict (6)────│
   │             │                 │─_build_response() │
   │             │◄─merged dict────│  merge + sanitise │
   │◄──HTTP 200──│                 │                  │
```

---

## 8. EvaluationService Architecture

`app/services/evaluation_service.py` contains all business logic.
It is a class instantiated once as a module-level singleton:

```python
evaluation_service = EvaluationService()
```

This matches the pattern of every other service in the project
(`gemini_service`, `pdf_service`, `tts_service`, `code_execution_service`).

### Module-level constant

```python
SCORE_WEIGHTS: Dict[str, float] = {
    "technical_accuracy_score": 0.30,
    "communication_score":      0.20,
    "behavioral_score":         0.20,
    "coding_score":             0.20,
    "project_score":            0.10,
}
```

Defined outside the class so weights can be adjusted in one place
without touching any aggregation logic.

### Public methods

| Method | Called by | Covers |
|---|---|---|
| `evaluate_answer(...)` | Router | Features 18, 19, 20, 22 |
| `generate_final_report(...)` | Router | Features 23, 24 |

### Private methods

| Method | Purpose |
|---|---|
| `_build_evaluation_prompt()` | Assembles per-question user prompt string |
| `_sanitise_evaluation_response(raw)` | Normalises Gemini's per-question response |
| `_compute_scores()` | Deterministic arithmetic aggregation across all answers |
| `_build_final_report_prompt()` | Assembles final report user prompt string |
| `_build_final_report_response()` | Merges computed scores with Gemini qualitative output |

---

## 9. Router Responsibilities

`app/routers/evaluation.py` is a **thin HTTP controller**.
It has exactly three responsibilities per route — nothing more.

1. Receive and validate the HTTP request via Pydantic model binding
2. Delegate all work to `evaluation_service`
3. Return the response model or convert exceptions to `HTTPException(500)`

The router has no knowledge of how prompts are built, how Gemini is called,
how scores are computed, or what fields Gemini returns.

**Rule for future maintainers:** if you find business logic in the router,
it belongs in `evaluation_service.py`.

---

## 10. Prompt Responsibilities

Both prompt files contain only **string constants**. No logic, no imports,
no functions. This separation means prompt text can be iterated without
touching any service or router code.

### `ANSWER_EVALUATION_SYSTEM_PROMPT` — `prompts/answer_evaluation.py`

Instructs Gemini to return **12 fields** covering all per-question evaluation
dimensions. Key instructions embedded in the prompt:

- `technical_score`: dedicated field for technical accuracy (Feature 19).
  For non-technical questions, set equal to `correctness`.
- `ideal_answer`: must be a **complete standalone model answer**, not a
  description of what a good answer would contain (Feature 18).
- `is_behavioral`: set `true` for HR/behavioral questions;
  `false` for technical, coding, resume, and JD-specific questions.
- `behavioral_score`: return a 0–100 STAR framework score when
  `is_behavioral` is true; return `null` (not `0`) when false.
- Calibration rule: reserve 90+ for exceptional answers only.

### `FINAL_REPORT_SYSTEM_PROMPT` — `prompts/final_report.py`

Instructs Gemini to return **6 qualitative fields only**. Key instructions:

- Scores are already computed. Do **not** recalculate or return any
  numeric fields.
- `strengths` and `weaknesses` must reference actual content from
  the session data, not generic interview feedback.
- `personalized_suggestions` must tie to the candidate's resume background
  and experience — not generic tips (Feature 24).
- `learning_roadmap` steps must name concrete resources (books, platforms,
  topics) — not vague instructions like "study more".
- `summary` must reference the provided scores and state a hiring recommendation.

---

## 11. Gemini vs Python Responsibilities

The fundamental boundary: **Gemini does intelligence. Python does arithmetic.**

### Gemini is responsible for

| Task | Endpoint |
|---|---|
| Score all evaluation dimensions (12 fields) | evaluate-answer |
| Generate `ideal_answer` — complete model answer (Feature 18) | evaluate-answer |
| Generate `feedback` — per-question critique | evaluate-answer |
| Identify `strengths` and `areas_for_improvement` per question | evaluate-answer |
| Determine `is_behavioral` — semantic classification | evaluate-answer |
| Score `behavioral_score` using STAR framework (Feature 22) | evaluate-answer |
| Synthesize aggregate `strengths` across full session (Feature 23) | final-report |
| Synthesize aggregate `weaknesses` (Feature 23) | final-report |
| Generate `key_takeaways` — hiring manager observations | final-report |
| Generate `learning_roadmap` — ordered improvement plan (Feature 24) | final-report |
| Generate `personalized_suggestions` — resume-tied advice (Feature 24) | final-report |
| Generate `summary` — executive narrative (Feature 24) | final-report |

### Python is responsible for

| Task | Method |
|---|---|
| `technical_accuracy_score` = mean of `eval.technical_score` | `_compute_scores` |
| `communication_score` = mean of `eval.communication_score` | `_compute_scores` |
| `behavioral_score` = mean of behavioral evals (filtered) | `_compute_scores` |
| `coding_score` = mean of `review.score` | `_compute_scores` |
| `project_score` = mean of `eval.score` for resume-type questions | `_compute_scores` |
| `overall_score` = normalized weighted mean of present categories | `_compute_scores` |
| Assembling `ideal_answers[]` from per-question data | `_compute_scores` |
| Pinning `face_missing_count` from original request | `_build_final_report_response` |
| Sanitising all Gemini output | `_sanitise_*` methods |

---

## 12. Score Computation & Weight Normalization

### Category score sources

| `FinalReportResponse` field | Source field | Source array | Filter |
|---|---|---|---|
| `technical_accuracy_score` | `evaluation.technical_score` | `questions_and_evaluations` | All questions |
| `communication_score` | `evaluation.communication_score` | `questions_and_evaluations` | All questions |
| `behavioral_score` | `evaluation.behavioral_score` | `questions_and_evaluations` | `is_behavioral == True` only |
| `coding_score` | `review.score` | `coding_evaluations` | All coding submissions |
| `project_score` | `evaluation.score` | `questions_and_evaluations` | `item.type == "resume"` only |

**On the `project_score` filter:** `"resume"` is the only `type` value
assigned to project/deep-dive questions by the question generation pipeline.
This is confirmed by the `QuestionItem` schema comment and the
`QUESTION_GENERATION_SYSTEM_PROMPT` JSON example. There are no aliases
(`"project"`, `"experience"`, etc.). The filter is exact and correct.

**On `jd_specific` questions:** These contribute to `technical_accuracy_score`
and `communication_score` but not `project_score`. JD-specific questions
test role-fit technical knowledge, not personal project experience.

### `None` vs `0.0`

If a category has no questions in a session, its score is `None` internally.
`None` means "not assessed" — semantically distinct from `0.0` which means
"assessed and scored zero". The distinction matters for overall score
calculation. After `overall_score` is computed, `None` values are converted
to `0.0` only for schema compliance (`FinalReportResponse` uses `float`,
not `Optional[float]`).

### Weight normalization

Weights are defined in `SCORE_WEIGHTS` at the top of `evaluation_service.py`.
When a category is absent (`None`), its weight is excluded and the
remaining weights are re-normalized so the total contribution equals 1.0.

```
active_weight_sum = sum(SCORE_WEIGHTS[k] for k in present categories)

overall_score = sum(
    score × (SCORE_WEIGHTS[k] / active_weight_sum)
    for each present category
)
```

**Example — session with only technical and communication:**

```
present:            technical=78.0, communication=82.0
active_weight_sum:  0.30 + 0.20 = 0.50

overall = 78.0 × (0.30/0.50) + 82.0 × (0.20/0.50)
        = 78.0 × 0.60 + 82.0 × 0.40
        = 46.80 + 32.80
        = 79.60
```

Without normalization (naive 0.0 for absent categories):
```
overall = 78.0×0.30 + 82.0×0.20 + 0×0.20 + 0×0.20 + 0×0.10
        = 23.40 + 16.40 = 39.80   ← unfairly penalizes the candidate
```

To adjust weights, edit `SCORE_WEIGHTS` in `evaluation_service.py`.
No other changes are needed anywhere.

---

## 13. Sanitisation Strategy

Both Gemini calls pass through a sanitisation step before reaching Pydantic
validation. This is necessary because Gemini occasionally returns unexpected
types for well-defined fields.

### Known Gemini quirks handled

| Quirk | Example | Risk without fix |
|---|---|---|
| Boolean as string | `"is_behavioral": "false"` | `bool("false") == True` in Python — technical question flagged as behavioral |
| Null for numeric field | `"score": null` | `float(None)` raises `TypeError` |
| Null for string field | `"ideal_answer": null` | `str(None) == "None"` — rendered as the word "None" in UI |
| Null for list field | `"strengths": null` | `list(None)` raises `TypeError` |
| Missing field | key absent from response | `KeyError` or wrong default |
| Numeric string | `"score": "85.0"` | `float("85.0")` works, handled safely |

### Helper functions (defined locally in `_sanitise_evaluation_response`)

**`safe_bool(val, default=False)`**  
Handles `bool`, `int` (1/0), `str` ("true"/"false"), `None`.  
String `"false"` maps to `False` via `.strip().lower() == "true"`.

**`safe_float(val, default=0.0)`**  
Explicit `None` guard first, then `float(val)` in try/except.  
Note: `or default` is not used — `0.0 or default` would wrongly replace
a genuine zero score.

**`safe_str(val, default="")`**  
Returns `""` for `None` rather than `str(None) == "None"`.

**`safe_list(val)`**  
Returns `val` if it's already a `list`, else `[]`.
Prevents `list(None)` crash and silently-corrupt non-list wrapping.

### `technical_score` fallback chain

```
1. Use raw["technical_score"]  if present and not null
2. Fall back to raw["correctness"]  (semantically equivalent)
3. Final fallback: 0.0
```

### `behavioral_score` gate

```python
if is_behavioral == True AND raw_behavioral is not None:
    behavioral_score = safe_float(raw_behavioral)
else:
    behavioral_score = None   # always, regardless of Gemini's value
```

If Gemini incorrectly sets `behavioral_score: 75.0` on a technical question,
the gate discards it and returns `None`.

### Final report sanitisation

In `_build_final_report_response`, numeric scores are **never read from
Gemini's response**. Even if Gemini returns an `"overall_score"` field in
violation of the prompt, it is ignored. All numeric values come exclusively
from the `computed` dict produced by `_compute_scores()`.

---

## 14. Integration with Teammate Modules

This module interacts with two teammate modules as a **consumer only**.
It does not modify any teammate code.

### Data consumed from teammates

| Teammate module | Data consumed | Where used in this module |
|---|---|---|
| Resume module (`/api/analyze-resume`) | `ResumeAnalysisResponse` — passed as `candidate_info` | `_build_final_report_prompt` reads `candidate_name`, `skills`, `experience_years`, `summary` to personalize Gemini's context |
| Coding module (`/api/review-code`) | `ReviewCodeResponse` — nested as `.review` in `coding_evaluations[]` | `_compute_scores` reads `review.score` to compute `coding_score` |

### Shared file constraints

| File | Constraint |
|---|---|
| `app/models/schemas.py` | Only the 4 fields documented in Section 4 were added. All other models are untouched. |
| `app/services/gemini_service.py` | Not modified. Only `generate_json()` is called. |
| `app/prompts/answer_evaluation.py` | `FOLLOW_UP_SYSTEM_PROMPT` in this file belongs to the interview module teammate. It must not be modified by this module. |

### Frontend components consuming this module's output

| Component | File | Fields read |
|---|---|---|
| `ReportSummary` | `components/dashboard/ReportSummary.jsx` | `overall_score`, `summary`, `strengths`, `weaknesses`, `learning_roadmap`, `ideal_answers`, `face_missing_count` |
| `ScoreCharts` | `components/dashboard/ScoreCharts.jsx` | `technical_accuracy_score`, `coding_score`, `communication_score`, `behavioral_score`, `project_score` |
| `SessionHistoryList` | `components/dashboard/SessionHistoryList.jsx` | `overall_score` (via `session.finalReport.overall_score`) |

---

## 15. Error Handling

### Router layer

Both routes wrap the service call in `try/except Exception`. Any unhandled
exception is caught and raised as:

```python
HTTPException(status_code=500, detail=str(e))
```

The frontend handles this:
- `evaluate-answer` error: caught silently, the answer is not stored
- `final-report` error: caught, user sees `alert("Error building final interview report.")`

### Gemini layer (`gemini_service.generate_json`)

The shared service has its own retry logic:
- Primary: configured model (default `gemini-2.5-flash`)
- Fallback models: `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`
- On `JSONDecodeError`: attempts regex extraction of JSON from response
- All models exhausted: raises the last exception, caught by the router

### Sanitisation layer

The sanitisation helpers never raise. Every possible Gemini output is
handled with a safe fallback. This is intentional: a missing `strengths`
field should produce an empty list, not a failed request. Interview data
is not retryable — preferring degraded output over a crash is the correct
trade-off here.

### Not handled

- Gemini returns completely invalid JSON (not recoverable by regex):
  the session fails with HTTP 500. The frontend alerts the user.
- Frontend sends `questions_and_evaluations: []` (empty array):
  `_compute_scores` returns `overall_score: 0.0`, all categories `None`.
  The report generates with zero scores. Not a crash, but a meaningless report.

---

## 16. Design Decisions

### Single Gemini call per endpoint

Each endpoint makes exactly one call to Gemini. This decision was made for
three reasons:

**Cost.** Multiple Gemini calls for the same answer multiply API cost without
improving accuracy. All evaluation dimensions share the same context — one
call is sufficient.

**Latency.** The interview loop calls `/api/evaluate-answer` after every
spoken answer. A single call keeps the UI responsive.

**Consistency.** All evaluation fields from a single call share the same
context window. Separate calls could produce internally inconsistent output —
for example, a high `technical_score` contradicting a negative `feedback`
generated in a different call.

### Python computes scores, Gemini synthesizes narrative

Asking Gemini to average a list of numbers introduces non-determinism.
Gemini may round differently, apply undocumented weights, or make arithmetic
errors. Python computes `overall_score` with the same result every time,
regardless of model version or temperature.

Gemini is reserved for tasks that genuinely require language intelligence:
understanding answer quality, recognizing STAR structure in free-form speech,
synthesizing patterns across many answers, and generating executive narrative.

### `None` for absent categories, not `0.0`

`None` represents "this category had no questions in this session."
It is semantically distinct from `0.0` which means "assessed and scored zero."
Using `None` allows the normalized weight calculation to exclude absent
categories entirely, so candidates are not penalized for session structures
that happen to omit behavioral or coding questions.

`None` is converted to `0.0` only at the response boundary where Pydantic
requires `float`. By that point, `overall_score` has already been computed
correctly.

### Prompts separated from service logic

System prompts are pure string constants in dedicated files under `app/prompts/`.
Prompt text can be iterated without touching service or router code.
A prompt engineer does not need to understand Python or FastAPI to improve
evaluation quality.

### Defensive sanitisation as a named step

Sanitisation is isolated in dedicated private methods rather than scattered
through the calling code. This makes the logic easy to read, test, and extend
when new Gemini quirks are discovered.

---

## 17. Current Limitations & Future Enhancements

### `personalized_suggestions` has no UI

**Status:** The field is populated by Gemini, returned in the response,
and saved to `localStorage` with every session. No frontend component
currently renders it.

**Recommended enhancement:** Add a "Personalized Suggestions" card to
`ReportSummary.jsx`, below the existing learning roadmap grid. No backend
changes required — the data is already present in every session object.

**Coordinate with:** The teammate responsible for `ReportSummary.jsx`.

---

### Per-question score breakdown has no UI

**Status:** Every `EvaluateAnswerResponse` stored in `answers[]` contains
`technical_score`, `behavioral_score`, and `is_behavioral` per question.
These are used only for aggregation. No UI shows per-question breakdowns.

**Recommended enhancement:** A "Question-by-Question Analysis" section in
the report using data already in `localStorage`. No backend changes required.

---

### Score weights are hardcoded in deployment

**Status:** `SCORE_WEIGHTS` is externalized as a named constant, easily
editable. Changing it requires a backend redeploy.

**Recommended enhancement:** Promote to an environment variable or
per-request parameter if per-role or dynamic weight configuration is needed.

---

### STAR sub-component scoring

**Status:** `behavioral_score` is a single aggregate score. The four STAR
components (Situation, Task, Action, Result) are not individually scored.

**Recommended enhancement:** Add `star_breakdown: Optional[dict]` to
`EvaluateAnswerResponse`. Extend `ANSWER_EVALUATION_SYSTEM_PROMPT` to return
sub-scores. No changes to the final report pipeline required.

---

## 18. Extension Guide

### Adding a new evaluation field to `/api/evaluate-answer`

1. Add the field to `ANSWER_EVALUATION_SYSTEM_PROMPT` — describe it,
   add it to the JSON template example.
2. Add a safe default to `_sanitise_evaluation_response()` using the
   appropriate helper (`safe_float`, `safe_str`, `safe_list`, `safe_bool`).
3. Add the field to `EvaluateAnswerResponse` in `schemas.py` with a safe default.
4. No router changes needed.

### Adding a new field to `/api/final-report`

**If deterministic (computed from existing data):**
1. Add the computation to `_compute_scores()` and include it in the return dict.
2. Add it to `_build_final_report_response()` sourced from `computed`.
3. Add the field to `FinalReportResponse` in `schemas.py`.

**If qualitative (requires Gemini):**
1. Add the field to `FINAL_REPORT_SYSTEM_PROMPT` — describe it, add to template.
2. Add it to `_build_final_report_response()` sourced from `raw` with a safe default.
3. Add the field to `FinalReportResponse` in `schemas.py`.

### Adjusting category weights

Edit `SCORE_WEIGHTS` at the top of `evaluation_service.py`.
The normalization logic reads from this dict dynamically.
No other changes required.

### Modifying prompts

Edit the relevant constant in `app/prompts/`. Changes take effect on the
next request when running with `--reload`. When editing
`answer_evaluation.py`, do not modify `FOLLOW_UP_SYSTEM_PROMPT` —
it belongs to the interview module teammate.

### Running the backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Endpoints:
```
POST http://localhost:8000/api/evaluate-answer
POST http://localhost:8000/api/final-report
```

Interactive API docs: `http://localhost:8000/docs`

---

*End of document.*
