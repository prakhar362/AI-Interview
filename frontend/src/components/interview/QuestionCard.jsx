import React from 'react';
import { Card, Badge, cn } from '../ui';
import { HelpCircle, Sparkles } from 'lucide-react';
import { AIWave } from '../ui/AIWave';

export function QuestionCard({ question, currentIndex, totalQuestions, darkTheme = false, waveState = 'idle' }) {
  if (!question) return null;

  const difficultyColors = {
    easy: 'emerald',
    medium: 'amber',
    hard: 'rose',
  };

  const typeLabels = {
    resume: 'Resume & Project',
    technical: 'Technical Concept',
    coding: 'Coding Challenge',
    behavioral: 'Behavioral / HR',
    jd_specific: 'Job Description Fit',
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      darkTheme ? "bg-transparent border-none shadow-none text-white flex flex-col items-center text-center" : "border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
    )}>
      <div className={cn("flex items-center gap-4 pb-4 mb-4", darkTheme ? "justify-center border-none" : "justify-between border-b border-black/10")}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#22F5B5] text-[#111111] font-black flex items-center justify-center text-xs shadow-sm">
            #{currentIndex + 1}
          </div>
          <div className={cn(darkTheme ? "text-left" : "")}>
            <span className={cn("text-xs uppercase tracking-wider font-bold block", darkTheme ? "text-white/60" : "text-[#666666]")}>Question {currentIndex + 1} of {totalQuestions}</span>
            <h4 className={cn("text-sm font-extrabold", darkTheme ? "text-white/90" : "text-[#111111]")}>{question.category || 'Interview Question'}</h4>
          </div>
        </div>

        {!darkTheme && (
          <div className="flex items-center gap-2">
            <Badge variant={difficultyColors[question.difficulty] || 'default'}>
              Difficulty: {question.difficulty?.toUpperCase()}
            </Badge>
            <Badge variant="primary">
              {typeLabels[question.type] || question.type}
            </Badge>
          </div>
        )}
      </div>

      <div className={cn("space-y-4", darkTheme ? "max-w-2xl flex flex-col items-center mt-2" : "")}>
        <div className={cn("flex gap-3", darkTheme ? "items-center justify-center flex-col" : "items-start")}>
          <Sparkles className={cn("w-5 h-5 flex-shrink-0", darkTheme ? "text-[#22F5B5] mb-1 opacity-80" : "text-[#111111] mt-1")} />
          <h2 className={cn(
            "leading-relaxed text-center",
            darkTheme 
              ? "text-xl md:text-2xl font-semibold text-white/90 tracking-normal" 
              : "text-xl font-black text-[#111111]"
          )}>
            {question.question}
          </h2>
        </div>

        {question.context && (
          <div className={cn(
            "flex items-start gap-2 p-3.5 rounded-xl border text-xs md:text-sm font-medium mt-2",
            darkTheme 
              ? "bg-white/5 border-white/10 text-white/70 max-w-lg mx-auto" 
              : "bg-[#F6F6F6] border-black/5 text-[#666666]"
          )}>
            <HelpCircle className={cn("w-4 h-4 flex-shrink-0 mt-0.5", darkTheme ? "text-white/70" : "text-[#111111]")} />
            <span className={darkTheme ? "text-center" : "text-left"}>{question.context}</span>
          </div>
        )}

        {/* Prominent SiriWave Container */}
        {darkTheme && (
          <div className="w-full mt-6 border-t border-white/10 pt-4 flex justify-center">
            <div className="w-full max-w-xl h-[100px] overflow-hidden rounded-2xl flex items-center justify-center bg-white/[0.02]">
              <AIWave state={waveState} />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
