import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Terminal } from 'lucide-react';
import { Card, Button, Progress, CircularProgress } from '../components/ui';
import { QuestionCard } from '../components/interview/QuestionCard';
import { VoiceRecorder } from '../components/interview/VoiceRecorder';
import { AIVoicePlayer } from '../components/interview/AIVoicePlayer';
import { FollowUpPrompt } from '../components/interview/FollowUpPrompt';
import { CodeEditor } from '../components/coding/CodeEditor';
import { LanguageSelector } from '../components/coding/LanguageSelector';
import { CodeReviewPanel } from '../components/coding/CodeReviewPanel';
import { WebcamMonitor } from '../components/webcam/WebcamMonitor';
import { AIWave } from '../components/ui/AIWave';
import { api } from '../lib/api';

export function InterviewPage({ sessionData, onCompleteInterview }) {
  const { questions, resumeText, resumeAnalysis } = sessionData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [codingAnswers, setCodingAnswers] = useState([]);
  const [faceMissingCount, setFaceMissingCount] = useState(0);

  // Current question states
  const currentQuestion = questions[currentIndex];
  const isCodingQuestion = currentQuestion?.type === 'coding';

  // Coding states
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeContent, setCodeContent] = useState('');
  const [executionResults, setExecutionResults] = useState(null);
  const [codeReviewData, setCodeReviewData] = useState(null);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Voice & Follow-up states
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [isUserListening, setIsUserListening] = useState(false);

  // Overall completion states
  const [isGeneratingFinalReport, setIsGeneratingFinalReport] = useState(false);

  // Sync initial code template when question changes
  useEffect(() => {
    if (isCodingQuestion && currentQuestion?.coding_template) {
      const initialLang = currentQuestion.coding_template.language || 'javascript';
      setSelectedLanguage(initialLang);

      // Support multi-language templates if provided by API, or fall back to single starter_code/default snippets
      const initialCode = getTemplateForLanguage(currentQuestion.coding_template, initialLang);
      setCodeContent(initialCode);

      setExecutionResults(null);
      setCodeReviewData(null);
    }
  }, [currentIndex, isCodingQuestion, currentQuestion]);

  // Helper to extract language-specific starter code from coding_template
  const getTemplateForLanguage = (codingTemplate, lang) => {
    if (!codingTemplate) return '// Write solution here';

    // If API provides templates object for multiple languages e.g. { javascript: '...', python: '...' }
    if (codingTemplate.templates && codingTemplate.templates[lang]) {
      return codingTemplate.templates[lang];
    }

    // Fallback: If current language matches the primary template language, use starter_code
    if (codingTemplate.language === lang && codingTemplate.starter_code) {
      return codingTemplate.starter_code;
    }

    // Default starter comments per language
    const defaults = {
      javascript: '// Write JavaScript solution here\n\nfunction solution() {\n  \n}',
      typescript: '// Write TypeScript solution here\n\nfunction solution(): void {\n  \n}',
      python: '# Write Python solution here\n\ndef solution():\n    pass',
      java: '// Write Java solution here\n\npublic class Solution {\n    public static void main(String[] args) {\n        \n    }\n}',
      cpp: '// Write C++ solution here\n\n#include <iostream>\n\nint main() {\n    return 0;\n}',
      c: '// Write C solution here\n\n#include <stdio.h>\n\nint main() {\n    return 0;\n}',
    };

    return defaults[lang] || '// Write solution here';
  };

  // Handler for language changes
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    if (currentQuestion?.coding_template) {
      const newCode = getTemplateForLanguage(currentQuestion.coding_template, newLang);
      setCodeContent(newCode);
    }
  };

  const handleSpokenAnswerSubmit = async (spokenText) => {
    setIsSubmittingAnswer(true);
    try {
      const evalResult = await api.evaluateAnswer({
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        questionType: currentQuestion.type,
        difficulty: currentQuestion.difficulty,
        userAnswer: spokenText,
        candidateResumeContext: resumeText,
      });

      const updatedAnswers = [
        ...answers,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          type: currentQuestion.type,
          difficulty: currentQuestion.difficulty,
          userAnswer: spokenText,
          evaluation: evalResult,
        }
      ];
      setAnswers(updatedAnswers);

      setIsGeneratingFollowUp(true);
      const followUpRes = await api.generateFollowUp(
        currentQuestion.question,
        spokenText,
        currentQuestion.context
      );
      setIsGeneratingFollowUp(false);

      if (followUpRes.needs_follow_up && followUpRes.follow_up_question) {
        setFollowUpQuestion(followUpRes.follow_up_question);
      } else {
        advanceToNextQuestion(updatedAnswers, codingAnswers);
      }
    } catch (err) {
      console.error('Answer evaluation error:', err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleCodingSubmit = async () => {
    setIsSubmittingCode(true);
    try {
      const testCases = currentQuestion?.coding_template?.test_cases || [];

      const execRes = await api.executeCode({
        problemStatement: currentQuestion.coding_template?.problem_statement || currentQuestion.question,
        code: codeContent,
        language: selectedLanguage,
        testCases,
      });
      setExecutionResults(execRes);

      const reviewRes = await api.reviewCode({
        problemStatement: currentQuestion.coding_template?.problem_statement || currentQuestion.question,
        code: codeContent,
        language: selectedLanguage,
        executionResults: execRes,
      });
      setCodeReviewData(reviewRes);

      const updatedCoding = [
        ...codingAnswers,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          language: selectedLanguage,
          submittedCode: codeContent,
          executionResults: execRes,
          review: reviewRes,
        }
      ];
      setCodingAnswers(updatedCoding);
    } catch (err) {
      console.error('Coding evaluation error:', err);
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const advanceToNextQuestion = (currentAnswersList = answers, currentCodingList = codingAnswers) => {
    setFollowUpQuestion(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishInterviewSession(currentAnswersList, currentCodingList);
    }
  };

  const finishInterviewSession = async (finalAnswers, finalCoding) => {
    setIsGeneratingFinalReport(true);
    try {
      const sessionId = `sess_${Date.now()}`;
      const report = await api.generateFinalReport({
        candidate_info: resumeAnalysis || {},
        session_id: sessionId,
        questions_and_evaluations: finalAnswers,
        coding_evaluations: finalCoding,
        face_missing_count: faceMissingCount,
      });

      onCompleteInterview({
        sessionId,
        finalReport: report,
        questionList: questions,
        answers: finalAnswers,
        codingAnswers: finalCoding,
        faceMissingCount,
      });
    } catch (err) {
      console.error('Final report generation failed:', err);
      alert('Error building final interview report.');
    } finally {
      setIsGeneratingFinalReport(false);
    }
  };

  if (isGeneratingFinalReport) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-4">
        <Loader2 className="w-16 h-16 text-[#111111] animate-spin mx-auto" />
        <h2 className="text-2xl font-black text-[#111111]">Generating Final Performance Report</h2>
        <p className="text-sm text-[#666666] font-medium">Gemini AI is rating technical depth, communication, STAR behavioral answers, and coding complexity...</p>
      </div>
    );
  }

  const handleQuit = () => {
    if (window.confirm("Are you sure you want to quit the interview early? Your answers will be evaluated.")) {
      finishInterviewSession(answers, codingAnswers);
    }
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  let waveState = "idle";
  if (isAIPlaying) {
    waveState = "speaking";
  } else if (isUserListening) {
    waveState = "listening";
  } else if (isSubmittingAnswer || isGeneratingFollowUp || isSubmittingCode) {
    waveState = "listening";
  }

  return (
    <div className="w-full min-h-screen bg-[#ECECEC] text-[#111111] max-w-6xl mx-auto space-y-6 px-4 pb-10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Main Interview Content */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Top Section: Central AI Question Card */}
          <div className={`relative rounded-3xl overflow-hidden p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-black/5 flex flex-col justify-center ${!isCodingQuestion ? 'bg-[#0a0a0a] min-h-[320px]' : 'bg-[#ececec]'}`}>
            <div className="z-10 flex flex-col justify-center max-w-4xl mx-auto w-full pt-4 pb-4">
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                darkTheme={!isCodingQuestion}
                waveState={waveState}
              />
            </div>
          </div>

          {/* Adaptive Follow-Up Question Prompt */}
          {followUpQuestion && (
            <FollowUpPrompt
              followUpQuestion={followUpQuestion}
              onAnswerFollowUp={() => setFollowUpQuestion(null)}
              onSkipFollowUp={() => advanceToNextQuestion()}
            />
          )}

          {/* Spoken Answer Input or Monaco Coding Challenge */}
          <div>
            {!isCodingQuestion ? (
              <VoiceRecorder
                onSubmitAnswer={handleSpokenAnswerSubmit}
                isSubmitting={isSubmittingAnswer || isGeneratingFollowUp}
                onListeningChange={setIsUserListening}
              />
            ) : (
              <Card className="border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] space-y-4">
                <div className="flex items-center justify-between border-b border-black/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#111111]" />
                    <h4 className="text-sm font-extrabold text-[#111111]">Monaco IDE Coding Solution</h4>
                  </div>
                  <LanguageSelector
                    language={selectedLanguage}
                    onChange={handleLanguageChange}
                  />
                </div>

                <CodeEditor
                  code={codeContent}
                  onChange={setCodeContent}
                  language={selectedLanguage}
                />

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="primary"
                    onClick={handleCodingSubmit}
                    disabled={isSubmittingCode || !codeContent.trim()}
                  >
                    {isSubmittingCode ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Executing & Reviewing...
                      </>
                    ) : (
                      <>
                        <Terminal className="w-4 h-4" /> Run & Submit Code
                      </>
                    )}
                  </Button>

                  {codeReviewData && (
                    <Button
                      variant="secondary"
                      onClick={() => advanceToNextQuestion()}
                    >
                      Next Question <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

                <CodeReviewPanel
                  executionResults={executionResults}
                  reviewData={codeReviewData}
                />
              </Card>
            )}
          </div>
        </div>

        {/* Right Sidebar - Camera, Progress, Quit & AI Voice Player */}
        <div className="w-full lg:w-[340px] flex flex-col gap-4 sticky top-24 self-start">
          <WebcamMonitor onMissingCountUpdate={setFaceMissingCount} />

          <Card className="flex flex-col items-center justify-center py-5 border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white text-center">
            <CircularProgress 
              value={progressPercent} 
              current={currentIndex + 1} 
              total={questions.length} 
              size={105} 
              strokeWidth={8} 
            />
            <div className="mt-2.5">
              <h5 className="text-xs font-extrabold text-[#111111] uppercase tracking-wider">Interview Progress</h5>
              <p className="text-[11px] text-[#666666] font-medium mt-0.5">{Math.round(progressPercent)}% Completed</p>
            </div>
          </Card>

          <Button 
            variant="outline" 
            className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 font-semibold shadow-sm"
            onClick={handleQuit}
          >
            Quit Interview
          </Button>

          {!isCodingQuestion && (
            <AIVoicePlayer 
              text={currentQuestion?.question} 
              autoPlay={true} 
              onPlayingChange={setIsAIPlaying}
            />
          )}
        </div>
      </div>
    </div>
  );
}