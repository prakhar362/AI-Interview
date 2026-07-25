import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mic, Bot, ShieldCheck } from 'lucide-react';

export function MockCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-full max-w-md mx-auto bg-[#222222] border border-white/[0.08] rounded-[22px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl overflow-hidden group"
    >
      {/* Ambient background glow behind card */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#22F5B5]/12 rounded-full blur-2xl group-hover:bg-[#22F5B5]/20 transition-all duration-500" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-white/5 rounded-full blur-2xl" />

      {/* Top Card Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22F5B5] text-[#111111] font-black flex items-center justify-center text-xs shadow-[0_0_12px_rgba(34,245,181,0.35)]">
            <Bot className="w-4 h-4 text-[#111111]" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider text-[#999999] font-bold block">
              AI INTERVIEWER • Q1 OF 12
            </span>
            <h4 className="text-xs font-bold text-white">System Architecture</h4>
          </div>
        </div>

        <span className="bg-[#22F5B5]/15 text-[#22F5B5] border border-[#22F5B5]/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22F5B5] animate-ping" />
          <span>Live Session</span>
        </span>
      </div>

      {/* Question Body */}
      <div className="space-y-3.5 relative z-10">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#22F5B5] shrink-0 mt-0.5" />
          <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
            "Can you walk me through your key contributions to designing microservices architecture in your recent project?"
          </p>
        </div>

        {/* Calm Waveform Input Indicator */}
        <div className="bg-[#191919] border border-white/[0.06] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#999999] font-semibold">
            <span className="flex items-center gap-1.5 text-white">
              <Mic className="w-3.5 h-3.5 text-[#22F5B5]" />
              <span>Candidate Spoken Answer</span>
            </span>
            <span className="text-[#22F5B5] font-bold">Listening naturally...</span>
          </div>

          {/* Animated Audio Frequency Bars */}
          <div className="flex items-center gap-1 h-6 pt-0.5">
            {[40, 75, 50, 90, 60, 100, 45, 80, 65, 95, 55, 70, 85, 40, 60].map((height, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${height * 0.3}%`, `${height}%`, `${height * 0.3}%`] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                className="flex-1 bg-gradient-to-t from-[#22F5B5] to-[#00c993] rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#999999] pt-1">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#22F5B5]" />
            <span>No score interrupts while answering</span>
          </span>
          <span className="font-semibold text-white/70">Calm Evaluation</span>
        </div>
      </div>
    </motion.div>
  );
}
