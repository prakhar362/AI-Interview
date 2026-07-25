import json
import logging
from typing import Dict, Any, List
from app.services.gemini_service import gemini_service

logger = logging.getLogger("code_review_service")

CODE_REVIEW_SYSTEM_PROMPT = """
You are an expert technical interviewer and senior software engineer.
You are evaluating a candidate's code submission for a coding problem.

You will be provided with:
1. The programming language
2. The problem statement
3. The candidate's code
4. A list of test cases (input and expected output)

Your task is to mentally execute the code against each test case, analyze the overall code quality, and provide a detailed review.
Output your response as strict JSON matching this exact structure:
{
  "score": float (0.0 to 100.0),
  "correctness": float (0.0 to 100.0),
  "code_quality": float (0.0 to 100.0),
  "time_complexity": "string (e.g. O(N))",
  "space_complexity": "string (e.g. O(1))",
  "test_case_results": [
    {
      "input": "string",
      "expected_output": "string",
      "actual_output": "string (what the code would output)",
      "passed": boolean,
      "reasoning": "string (why it passed or failed)"
    }
  ],
  "suggestions": ["string", "string"],
  "optimized_code": "string (fully working optimized code in the same language)"
}
"""

class CodeReviewService:
    async def review_code(
        self,
        problem_statement: str,
        code: str,
        language: str,
        test_cases: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        prompt = f"""
Language: {language}
Problem Statement: {problem_statement}
Candidate Code:
```{language}
{code}
```

Test Cases to evaluate:
{json.dumps(test_cases, indent=2)}

Please simulate running this code against each test case and provide the review in the requested JSON format.
"""
        try:
            return await gemini_service.generate_json(prompt, CODE_REVIEW_SYSTEM_PROMPT)
        except Exception as e:
            logger.error(f"Code review simulation error: {e}")
            # Fallback mock response in case of API failure
            return {
                "score": 0.0,
                "correctness": 0.0,
                "code_quality": 0.0,
                "time_complexity": "Unknown",
                "space_complexity": "Unknown",
                "test_case_results": [],
                "suggestions": [f"Error occurred during evaluation: {str(e)}"],
                "optimized_code": code
            }

code_review_service = CodeReviewService()
