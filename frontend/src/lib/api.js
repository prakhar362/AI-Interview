import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Resume & JD
  analyzeResume: async (resumeText) => {
    const res = await client.post('/analyze-resume', { resume_text: resumeText });
    return res.data;
  },
  analyzeJD: async (jdText, resumeText = '') => {
    const res = await client.post('/analyze-jd', { jd_text: jdText, resume_text: resumeText });
    return res.data;
  },

  // Questions
  generateQuestions: async (resumeText, jdText = '') => {
    const res = await client.post('/generate-questions', {
      resume_text: resumeText,
      jd_text: jdText,
    });
    return res.data;
  },
  generateFollowUp: async (question, userAnswer, context = '') => {
    const res = await client.post('/follow-up', {
      question,
      user_answer: userAnswer,
      context,
    });
    return res.data;
  },

  // Evaluation
  evaluateAnswer: async ({ questionId, questionText, questionType, difficulty, userAnswer, candidateResumeContext }) => {
    const res = await client.post('/evaluate-answer', {
      question_id: questionId,
      question_text: questionText,
      question_type: questionType,
      difficulty,
      user_answer: userAnswer,
      candidate_resume_context: candidateResumeContext,
    });
    return res.data;
  },

  // Coding
  executeCode: async ({ problemStatement, code, language, testCases }) => {
    const res = await client.post('/execute-code', {
      problem_statement: problemStatement,
      code,
      language,
      test_cases: testCases,
    });
    return res.data;
  },
  reviewCode: async ({ problemStatement, code, language, executionResults }) => {
    const res = await client.post('/review-code', {
      problem_statement: problemStatement,
      code,
      language,
      execution_results: executionResults,
    });
    return res.data;
  },

  // Final Report
  generateFinalReport: async (payload) => {
    // Support both camelCase (old callers) and snake_case (InterviewPage) field names
    const candidateInfo         = payload.candidateInfo         ?? payload.candidate_info         ?? {};
    const sessionId             = payload.sessionId             ?? payload.session_id             ?? '';
    const questionsAndEvals     = payload.questionsAndEvaluations ?? payload.questions_and_evaluations ?? [];
    const codingEvals           = payload.codingEvaluations     ?? payload.coding_evaluations     ?? [];
    const faceMissingCount      = payload.faceMissingCount      ?? payload.face_missing_count     ?? 0;

    const res = await client.post('/final-report', {
      candidate_info:              candidateInfo,
      session_id:                  sessionId,
      questions_and_evaluations:   questionsAndEvals,
      coding_evaluations:          codingEvals,
      face_missing_count:          faceMissingCount,
    });
    return res.data;
  },

  // TTS Audio
  getAudioStream: async (text, voice = 'en-US-ChristopherNeural') => {
    const res = await client.post(
      '/speak',
      { text, voice },
      { responseType: 'blob' }
    );
    return URL.createObjectURL(res.data);
  },
};
