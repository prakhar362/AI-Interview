import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { RobotHero } from '../components/ui/robot-hero';
import { LandingScrollSections } from '../components/landing/LandingScrollSections';
import { HowItWorksTimeline } from '../components/landing/HowItWorksTimeline';

export function LandingPage({ onStartInterview, onStartClick, sessionsCount = 0 }) {
  const handleStart = onStartInterview || onStartClick;

  const scrollToTimeline = (e) => {
    if (e) e.preventDefault();
    const el = document.getElementById('how-it-works-timeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#141414] text-white flex flex-col font-sans selection:bg-[#22F5B5]/30">
      {/* 3D Robot Hero Landing (Primary Hero & Antenna Navbar) */}
      <RobotHero 
        backgroundText="AI INTERVIEW"
        navItemsLeft={[
          { label: 'Upload Resume', href: '/upload', onClick: (e) => { e.preventDefault(); handleStart?.(); } },
          { label: 'Workflow', href: '#how-it-works-timeline', onClick: scrollToTimeline },
        ]}
        contactText=""
        ctaText="Start Session"
        onCtaClick={handleStart}
      />

      {/* GSAP 3 Full-Screen Scroll Reveal Sections */}
      <LandingScrollSections onStartClick={handleStart} />

      {/* Aceternity UI 10-Step How It Works Timeline */}
      <HowItWorksTimeline />

      {/* Premium Dark CTA Section after Timeline */}
      <section
        className="relative w-full py-24 px-6 sm:px-12 text-center flex flex-col items-center justify-center overflow-hidden border-t border-white/[0.08]"
        style={{
          backgroundColor: '#141414',
          backgroundImage: `
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(34, 245, 181, 0.08) 0%, rgba(34, 245, 181, 0.04) 30%, transparent 75%),
            linear-gradient(180deg, rgba(0, 0, 0, 0.2), transparent 15%, transparent 85%, rgba(0, 0, 0, 0.3))
          `,
        }}
      >
        {/* Ambient Decorative Lighting & Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-[#22F5B5]/05 rounded-full blur-3xl pointer-events-none" />
          
          {/* Low-opacity subtle blurred blobs */}
          <div className="absolute top-1/4 left-1/5 w-64 h-64 bg-[#22F5B5]/04 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/5 w-80 h-80 bg-white/03 rounded-full blur-3xl" />

          {/* Tiny Floating Emerald Particles */}
          <div className="absolute top-12 right-24 w-2 h-2 rounded-full bg-[#22F5B5] shadow-[0_0_12px_#22F5B5] animate-pulse" />
          <div className="absolute bottom-16 left-20 w-2 h-2 rounded-full bg-[#22F5B5]/80 shadow-[0_0_10px_#22F5B5]" />
          <div className="absolute top-1/2 left-12 w-1.5 h-1.5 rounded-full bg-[#22F5B5]/60" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-6 flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22F5B5]/10 border border-[#22F5B5]/30 text-xs font-black tracking-wider text-[#22F5B5] uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#22F5B5]" />
            <span>READY FOR YOUR PLACEMENT?</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-6xl font-black text-[#F5F5F5] tracking-tight leading-tight">
            Ready to Practice?
          </h2>

          {/* Description */}
          <p className="text-base sm:text-xl text-[#A1A1AA] font-medium max-w-xl mx-auto leading-relaxed">
            Upload your resume and begin a personalized AI interview tailored to your experience.
          </p>

          {/* Premium Glowing Emerald Button */}
          <div className="pt-4">
            <button
              onClick={handleStart}
              className="px-10 py-5 bg-[#22F5B5] text-[#111111] font-black text-xl rounded-full shadow-[0_4px_25px_rgba(34,245,181,0.4)] hover:shadow-[0_0_40px_rgba(34,245,181,0.8)] hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3 group cursor-pointer border border-[#22F5B5]/50 backdrop-blur-md"
            >
              <span>Start Your AI Interview</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
