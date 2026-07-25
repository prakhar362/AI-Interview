import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Send, RefreshCw, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { API_BASE_URL } from '../../lib/api';

export function VoiceInterviewPanel({
  question,
  resumeContext = '',
  difficulty = 'medium',
  onCompleteStep
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [followUpResult, setFollowUpResult] = useState(null);

  const audioRef = useRef(null);

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    setTranscript
  } = useSpeechToText();

  const questionText = typeof question === 'string' ? question : question?.question || '';

  // Update text input when Web Speech API transcribes
  useEffect(() => {
    if (transcript) {
      setTextAnswer(transcript);
    }
  }, [transcript]);

  // Fetch TTS audio when question changes
  useEffect(() => {
    if (!questionText) return;

    let isMounted = true;
    const fetchTTS = async () => {
      setIsAudioLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/tts/speak`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: questionText }),
        });

        if (!res.ok) {
          // Try fallback endpoint
          const fallbackRes = await fetch(`${API_BASE_URL}/api/speak`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: questionText }),
          });
          if (!fallbackRes.ok) throw new Error('TTS audio generation failed');
          const blob = await fallbackRes.blob();
          if (isMounted) {
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
          return;
        }

        const blob = await res.blob();
        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      } catch (err) {
        console.warn('TTS Audio error:', err);
      } finally {
        if (isMounted) setIsAudioLoading(false);
      }
    };

    fetchTTS();

    return () => {
      isMounted = false;
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [questionText]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(console.warn);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!textAnswer.trim() || isSubmitting) return;
    if (isListening) stopListening();

    setIsSubmitting(true);

    try {
      // 1. POST /interview/evaluate-answer
      const evalRes = await fetch(`${API_BASE_URL}/interview/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          candidateAnswer: textAnswer,
          resumeContext: resumeContext,
          difficulty: difficulty,
          question_text: questionText,
          user_answer: textAnswer,
          candidate_resume_context: resumeContext
        })
      });

      let evalData;
      if (evalRes.ok) {
        evalData = await evalRes.json();
      } else {
        // Fallback to /api/evaluate-answer
        const evalFallback = await fetch(`${API_BASE_URL}/api/evaluate-answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: question?.id || 1,
            question_text: questionText,
            question_type: question?.type || 'technical',
            difficulty: difficulty,
            user_answer: textAnswer,
            candidate_resume_context: resumeContext
          })
        });
        evalData = await evalFallback.json();
      }

      setEvaluationResult(evalData);

      // 2. POST /interview/follow-up
      const followRes = await fetch(`${API_BASE_URL}/interview/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          candidateAnswer: textAnswer,
          user_answer: textAnswer,
          evaluation: {
            technicalScore: evalData.technicalScore || evalData.score || 8,
            feedback: evalData.feedback || ''
          }
        })
      });

      let followData = {};
      if (followRes.ok) {
        followData = await followRes.json();
        setFollowUpResult(followData);
      }

      if (onCompleteStep) {
        onCompleteStep({
          userAnswer: textAnswer,
          evaluation: evalData,
          followUp: followData
        });
      }
    } catch (err) {
      console.error('Error evaluating voice answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-6 border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-white">
      {/* Header & TTS Control */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="uppercase tracking-wider font-extrabold text-[10px]">
            Voice Interview Mode
          </Badge>
          <span className="text-xs font-bold text-[#666666]">
            Difficulty: <span className="capitalize text-[#111111]">{difficulty}</span>
          </span>
        </div>

        {audioUrl && (
          <div className="flex items-center gap-2">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlayingAudio(false)}
              className="hidden"
            />
            <Button
              size="sm"
              variant={isPlayingAudio ? 'primary' : 'secondary'}
              onClick={toggleAudio}
              disabled={isAudioLoading}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 mr-1" /> Pause Question Voice
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-1 text-[#111111]" /> Listen Question Voice
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Question Display */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-black tracking-wider text-[#666666]">AI Interviewer Question</span>
        <h3 className="text-lg font-black text-[#111111] leading-snug">
          {questionText}
        </h3>
      </div>

      {/* Speech Recognition & Response Input */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-[#111111]" /> Candidate Spoken Answer Transcript
          </label>

          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold animate-pulse bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Recording Voice Input...
            </span>
          )}
        </div>

        <textarea
          rows={5}
          value={textAnswer}
          onChange={(e) => setTextAnswer(e.target.value)}
          placeholder={
            isSupported
              ? "Click 'Answer by Voice' below and speak your response, or type directly..."
              : "Web Speech API is not supported in your browser (e.g. Safari/Firefox). Please type your spoken response here..."
          }
          className="w-full bg-[#F6F6F6] border border-black/10 rounded-2xl p-4 text-[#111111] text-sm focus:outline-none focus:border-[#22F5B5] focus:bg-white transition-all placeholder:text-zinc-400 font-sans"
        />

        {!isSupported && (
          <div className="flex items-center gap-2 text-amber-900 text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Web Speech API is unsupported in this browser. Voice typing fallback active.</span>
          </div>
        )}

        {speechError && (
          <div className="flex items-center gap-2 text-amber-900 text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isListening ? 'danger' : 'secondary'}
              onClick={toggleRecording}
              disabled={!isSupported || isSubmitting}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-bounce" /> Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#111111]" /> Answer by Voice
                </>
              )}
            </Button>

            {textAnswer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setTranscript(''); setTextAnswer(''); }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Transcript
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmitAnswer}
            disabled={!textAnswer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit & Evaluate Answer
          </Button>
        </div>
      </div>

      {/* Real-time Evaluation Results */}
      {evaluationResult && (
        <div className="bg-[#F6F6F6] border border-black/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-[#111111] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#111111]" /> Real-Time Gemini AI Evaluation
            </h4>
            <Badge variant="emerald">
              Score: {evaluationResult.technicalScore || evaluationResult.score || 8}/10
            </Badge>
          </div>

          <p className="text-xs text-[#666666] font-medium">
            {evaluationResult.feedback || evaluationResult.communicationNotes}
          </p>

          {followUpResult?.followUpQuestion && (
            <div className="bg-white border border-black/10 rounded-xl p-3.5 space-y-1 mt-2">
              <span className="text-[10px] font-black uppercase text-[#111111]">Generated Adaptive Follow-up Question</span>
              <p className="text-xs font-bold text-[#111111]">{followUpResult.followUpQuestion}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
