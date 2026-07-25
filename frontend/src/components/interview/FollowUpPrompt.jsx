import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Card, Button } from '../ui';

export function FollowUpPrompt({ followUpQuestion, onAnswerFollowUp, onSkipFollowUp }) {
  if (!followUpQuestion) return null;

  return (
    <Card className="border-[#22F5B5]/50 bg-white shadow-[0_10px_30px_rgba(34,245,181,0.15)]">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-[#22F5B5] text-[#111111] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <HelpCircle className="w-4 h-4 text-[#111111]" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#111111]">Adaptive AI Follow-Up</span>
          </div>
          <p className="text-sm font-extrabold text-[#111111] leading-relaxed">
            {followUpQuestion}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Button size="sm" variant="primary" onClick={onAnswerFollowUp}>
              Answer Follow-Up <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onSkipFollowUp}>
              Skip & Next Question
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
