import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { MockCard } from './MockCard';
import { RotatingDocs } from './RotatingDocs';

export function LandingScrollSections() {
  return (
    <div className="w-full bg-[#1B1B1B] text-white font-sans overflow-hidden">
      {/* SECTION 1 — Feels like an interview, not a quiz app */}
      <section
        className="relative w-full py-14 sm:py-16 px-6 sm:px-10 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1D1D1D 0%, #1A1A1A 50%, #1C1C1C 100%)',
        }}
      >
        {/* Subtle Tinting Emerald Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 60% at 35% 50%, rgba(34, 245, 181, 0.06) 0%, rgba(34, 245, 181, 0.03) 35%, transparent 75%)',
          }}
        />

        <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-4 max-w-xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22F5B5]/10 border border-[#22F5B5]/30 text-[11px] font-black tracking-wider text-[#22F5B5] uppercase">
              <Sparkles className="w-3 h-3 text-[#22F5B5]" />
              <span>REAL INTERVIEW EXPERIENCE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              <span className="text-white block">Feels like an interview,</span>
              <span className="text-[#999999] italic font-normal block">not a quiz app.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#999999] font-medium leading-relaxed max-w-md">
              Practice exactly how real interviews happen. One question at a time. Speak naturally. No distractions. No gamified streaks. Just a calm interview environment where you can think before answering.
            </p>

            <div className="p-3 px-4 rounded-xl bg-[#222222] border border-white/[0.08] inline-block shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22F5B5] shadow-[0_0_8px_#22F5B5]" />
                <span className="text-[#22F5B5]">No score interruptions while answering.</span>
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2.5 text-xs">
              <span className="font-bold text-[#999999]">
                Powered by Gemini 2.5 Flash
              </span>
              <span className="text-white/20">•</span>
              <span className="text-white/50 font-medium">Real-Time Voice AI</span>
            </div>
          </motion.div>

          {/* Right Showcase: MockCard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <MockCard />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — Upload. Analyze. Interview. */}
      <section
        className="relative w-full py-14 sm:py-16 px-6 sm:px-10 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #1C1C1C 0%, #1A1A1A 50%, #1D1D1D 100%)',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 60% at 65% 50%, rgba(34, 245, 181, 0.05) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 75%)',
          }}
        />

        <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Left Showcase: RotatingDocs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <RotatingDocs />
          </motion.div>

          {/* Right Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 space-y-4 order-1 lg:order-2 max-w-xl"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22F5B5]/10 border border-[#22F5B5]/30 text-[11px] font-black tracking-wider text-[#22F5B5] uppercase">
              <Sparkles className="w-3 h-3 text-[#22F5B5]" />
              <span>SMART DOCUMENT ANALYSIS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
              <span className="text-white block">Your resume.</span>
              <span className="text-white block">Your job description.</span>
              <span className="text-[#22F5B5] block">One personalized interview.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#999999] font-medium leading-relaxed max-w-md">
              Upload your resume and optionally add a job description. Our AI understands your skills, projects, technologies and experience before generating interview questions tailored specifically for you.
            </p>

            {/* 3 Horizontal Feature Rows */}
            <div className="space-y-2 pt-1">
              {[
                'Resume Analysis & Skill Extraction',
                'Job Description Fit & Context Matching',
                'Personalized Question Generation',
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: 0.1 * idx }}
                  className="flex items-center gap-2.5 p-2.5 px-3.5 rounded-lg bg-[#222222] border border-white/[0.08]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#22F5B5]/20 text-[#22F5B5] flex items-center justify-center border border-[#22F5B5]/40 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22F5B5]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-white">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Glowing Outline Badge */}
            <div className="pt-3 border-t border-white/[0.08]">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#22F5B5]/40 text-[11px] font-bold text-[#22F5B5] bg-[#22F5B5]/10 shadow-[0_0_12px_rgba(34,245,181,0.15)]">
                <Sparkles className="w-3 h-3 text-[#22F5B5]" />
                <span>Gemini 2.5 Flash • Resume Intelligence</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
