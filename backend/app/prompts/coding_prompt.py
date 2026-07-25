CODING_QUESTION_GENERATION_PROMPT = """
You are a technical interviewer generating a coding question for a candidate.
Generate a classic, well-known Data Structures & Algorithms question.

CRITICAL REQUIREMENT:
The difficulty MUST be "Easy" or "Medium" at most (e.g., Two Sum, Valid Parentheses, Palindrome Check). Do not generate overly complex dynamic programming or hard tree/graph problems. Keep it accessible.

Language requested: {language}
Resume Context (if any): {resume_context}

Return a JSON object strictly matching this format:
{{
  "language": "the requested programming language",
  "problem_statement": "The full markdown description of the problem, including examples and constraints.",
  "starter_code": "The boilerplate code the user will see in their editor (e.g., 'def two_sum(nums, target):\\n    pass'). Make sure it matches the requested language.",
  "test_cases": [
    {{
      "input": "Raw input values separated by a pipe if multiple (e.g., '[2, 7, 11, 15] | 9'). Use standard ASCII characters. Do NOT include variable names or assignments.",
      "expected_output": "The expected result (e.g., '[0, 1]')"
    }}
  ]
}}

Generate exactly 3 test cases. Ensure the JSON is valid.
"""
