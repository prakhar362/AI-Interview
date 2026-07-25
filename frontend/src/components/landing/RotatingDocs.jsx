import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Cpu, FileCheck } from 'lucide-react';

export function RotatingDocs() {
  return (
    <div className="relative w-full max-w-md mx-auto h-[320px] sm:h-[350px] flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[#22F5B5]/10 rounded-full blur-2xl" />

      {/* Card 1: Resume Document */}
      <motion.div
        animate={{
          rotateY: [-5, 5, -5],
          rotateX: [3, -3, 3],
          y: [-6, 6, -6],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-3 left-3 right-6 bg-[#222222] border border-white/[0.08] rounded-[20px] p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl z-20"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#22F5B5]/20 text-[#22F5B5] flex items-center justify-center border border-[#22F5B5]/40">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Candidate_Resume.pdf</h4>
              <span className="text-[9px] text-[#999999]">Parsed • 3.2 YOE</span>
            </div>
          </div>
          <span className="text-[9px] bg-[#22F5B5]/15 text-[#22F5B5] border border-[#22F5B5]/30 font-bold px-2 py-0.5 rounded-full">
            Parsed Skills
          </span>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
            Full-Stack Software Engineer specializing in React, Node.js, Python, PostgreSQL & Distributed Systems.
          </p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {['React.js', 'Python FastAPI', 'System Design', 'PostgreSQL'].map((skill, idx) => (
              <span
                key={idx}
                className="text-[9px] bg-white/5 border border-white/10 text-white/90 font-medium px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Card 2: Job Description Match Document */}
      <motion.div
        animate={{
          rotateY: [5, -5, 5],
          rotateX: [-3, 3, -3],
          y: [6, -6, 6],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-3 right-3 left-6 bg-[#1E1E1E] border border-[#22F5B5]/30 rounded-[20px] p-4 sm:p-5 shadow-[0_20px_45px_rgba(34,245,181,0.15)] backdrop-blur-xl z-30"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#22F5B5] text-[#111111] flex items-center justify-center font-bold shadow-[0_0_10px_#22F5B5]">
              <FileCheck className="w-3.5 h-3.5 text-[#111111]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Target_Job_Description.txt</h4>
              <span className="text-[9px] text-[#22F5B5] font-semibold">92% Match Rating</span>
            </div>
          </div>
          <span className="text-[9px] bg-white/10 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#22F5B5]" />
            <span>AI Matched</span>
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#22F5B5]">
            <span>Personalized Question Focus</span>
            <Sparkles className="w-3 h-3" />
          </div>
          <p className="text-[11px] text-white/90 font-medium leading-normal">
            Generated targeted questions assessing concurrency, state management, and system trade-offs.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
