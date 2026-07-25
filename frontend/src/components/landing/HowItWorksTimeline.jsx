import React, { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import {
  Upload,
  FileSearch,
  BrainCircuit,
  Camera,
  PlayCircle,
  Code2,
  MessageSquareMore,
  CircleCheckBig,
  BarChart3,
  TrendingUp,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function HowItWorksTimeline() {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 15%', 'end 85%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const timelineData = [
    {
      step: '01',
      title: 'Upload Your Resume',
      icon: Upload,
      badge: 'Step 01',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Upload your resume as a PDF.
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Our AI reads your actual skills, projects, experience, education, and technologies directly from your resume to build a personalized interview.
          </p>
        </div>
      ),
    },
    {
      step: '02',
      title: 'Add Job Description',
      subtitle: '(Optional)',
      icon: FileSearch,
      badge: 'Step 02',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Preparing for a specific company or role?
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Paste or upload the job description and the AI customizes the interview around those requirements.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#22F5B5]/15 border border-[#22F5B5]/30 text-xs font-bold text-[#111111]">
            <Sparkles className="w-3.5 h-3.5 text-[#00c993]" />
            <span>Skip this step if you simply want a resume-based interview</span>
          </div>
        </div>
      ),
    },
    {
      step: '03',
      title: 'Generate Interview Plan',
      icon: BrainCircuit,
      badge: 'Step 03',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            The AI analyzes your resume and job description (if provided) to create a unique interview consisting of:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {[
              'Resume & Project Questions',
              'Technical Questions',
              'Coding Challenges',
              'Behavioral & HR Questions',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#111111] bg-white/40 px-3.5 py-2 rounded-xl border border-white/60">
                <CheckCircle2 className="w-4 h-4 text-[#00c993] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-xs sm:text-sm text-[#666666] font-semibold pt-1">
            • Approximately 15–20 personalized questions are generated.
          </p>
        </div>
      ),
    },
    {
      step: '04',
      title: 'Enable Mic & Camera',
      icon: Camera,
      badge: 'Step 04',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Grant microphone permission for voice interaction and camera access for presence monitoring.
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            The AI interviewer speaks naturally while ensuring you're actively participating throughout the interview.
          </p>
        </div>
      ),
    },
    {
      step: '05',
      title: 'Start Your Interview',
      icon: PlayCircle,
      badge: 'Step 05',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Begin your AI interview.
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Questions are asked one at a time through voice, with difficulty increasing gradually to simulate a real technical interview.
          </p>
        </div>
      ),
    },
    {
      step: '06',
      title: 'Answer Naturally',
      icon: Code2,
      badge: 'Step 06',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Speak your answers normally for interview questions.
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            For coding rounds, switch to the integrated code editor, choose your programming language, and solve problems directly inside the platform.
          </p>
        </div>
      ),
    },
    {
      step: '07',
      title: 'Receive Follow-up Questions',
      icon: MessageSquareMore,
      badge: 'Step 07',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            The AI evaluates every answer in real time.
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Based on your response, it may ask intelligent follow-up questions exactly like an experienced interviewer would.
          </p>
        </div>
      ),
    },
    {
      step: '08',
      title: 'Complete the Interview',
      icon: CircleCheckBig,
      badge: 'Step 08',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            After all interview questions are completed, your session automatically ends and the AI prepares a detailed evaluation.
          </p>
        </div>
      ),
    },
    {
      step: '09',
      title: 'View Performance Report',
      icon: BarChart3,
      badge: 'Step 09',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Receive a comprehensive interview report including:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              'Technical Accuracy',
              'Communication Score',
              'Coding Performance',
              'Strengths',
              'Weaknesses',
              'Improved Answers',
              'Overall Rating',
              'Personalized Feedback',
            ].map((metric, idx) => (
              <div key={idx} className="bg-white/40 border border-white/60 rounded-xl p-2.5 text-center">
                <span className="text-xs font-bold text-[#111111]">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      step: '10',
      title: 'Track Your Growth',
      icon: TrendingUp,
      badge: 'Step 10',
      content: (
        <div className="space-y-4">
          <p className="text-base sm:text-lg text-[#333333] font-medium leading-relaxed">
            Download your complete interview report as a PDF.
          </p>
          <p className="text-sm sm:text-base text-[#555555] leading-relaxed">
            Visit your Performance Dashboard anytime to compare previous interviews, monitor progress, and continuously improve your placement readiness.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div
      id="how-it-works-timeline"
      ref={containerRef}
      className="relative w-full bg-[#cecbcb] text-[#111111] font-sans py-20 px-4 sm:px-8 md:px-12 overflow-hidden"
      style={{
        background:
          'linear-gradient(to bottom, #ECECEC 0%, #bebebe 40%, #cecbcb 80%, #ECECEC 100%)',
      }}
    >
      {/* Subtle Background Motion & Floating Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/6 left-1/4 w-96 h-96 bg-[#22F5B5]/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 right-1/5 w-[30rem] h-[30rem] bg-white/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#22F5B5]/10 rounded-full blur-3xl"
        />

        {/* Floating particles */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-36 right-20 w-2 h-2 rounded-full bg-[#22F5B5] shadow-[0_0_12px_#22F5B5]"
        />
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-2/3 left-16 w-2.5 h-2.5 rounded-full bg-white/80 shadow-[0_0_10px_white]"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-48 right-32 w-2 h-2 rounded-full bg-[#22F5B5] opacity-70"
        />
      </div>

      {/* Header Section Reversible Entrance Animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: false, amount: 0.2 }}
        className="relative z-10 max-w-5xl mx-auto text-center space-y-4 mb-16 md:mb-24"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#22F5B5]/20 border border-[#22F5B5]/40 text-xs font-black tracking-wide text-[#111111] uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#00c993]" />
          <span>Interactive Journey</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight">
          How Your AI Interview Works
        </h2>

        <p className="text-base sm:text-xl text-[#444444] font-medium max-w-2xl mx-auto leading-relaxed">
          A complete interview experience—from uploading your resume to receiving a detailed AI performance report.
        </p>
      </motion.div>

      {/* Aceternity Timeline Section */}
      <div ref={ref} className="relative z-10 max-w-6xl mx-auto">
        {/* Animated Vertical Line (Bi-directional: fills down on scroll down, retracts up on scroll up) */}
        <div
          style={{ height: height ? `${height}px` : '100%' }}
          className="absolute left-4 md:left-8 top-0 overflow-hidden w-[2px] bg-black/15 [mask-image:linear-gradient(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-b from-[#22F5B5] via-[#00c993] to-[#22F5B5] rounded-full shadow-[0_0_15px_#22F5B5]"
          />
        </div>

        {/* Timeline Items with Reversible Repeatable Animations */}
        <div className="space-y-12 md:space-y-20">
          {timelineData.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.96, filter: 'blur(6px)' }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: false, amount: 0.35 }}
                className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-12 pl-10 md:pl-20 relative group"
              >
                {/* Timeline Dot (Dynamic Spring Bounce & Mint Glow on Re-entry) */}
                <motion.div
                  initial={{ scale: 0.7 }}
                  whileInView={{ scale: [0.7, 1.15, 1] }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  viewport={{ once: false, amount: 0.35 }}
                  className="absolute left-0 md:left-4 top-1.5 -translate-x-1/2 z-20 flex items-center justify-center"
                >
                  <div className="w-9 h-9 rounded-full bg-white/70 border border-white/90 backdrop-blur-md flex items-center justify-center shadow-md group-hover:border-[#22F5B5] group-hover:shadow-[0_0_20px_#22F5B5] transition-all duration-300">
                    <motion.div
                      initial={{ scale: 0.6, opacity: 0.5 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      viewport={{ once: false, amount: 0.35 }}
                      className="w-3.5 h-3.5 rounded-full bg-[#22F5B5] shadow-[0_0_12px_#22F5B5]"
                    />
                  </div>
                </motion.div>

                {/* Left Column: Sticky Title on Desktop (Re-animates when scrolling up) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  viewport={{ once: false, amount: 0.35 }}
                  className="md:sticky md:top-36 self-start md:w-1/3 shrink-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-md bg-black text-[#22F5B5] tracking-wider uppercase shadow-xs">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#111111] leading-tight">
                    {item.title}{' '}
                    {item.subtitle && (
                      <span className="text-lg font-bold text-[#666666] block sm:inline">
                        {item.subtitle}
                      </span>
                    )}
                  </h3>
                </motion.div>

                {/* Right Column: Glassmorphism Content Card */}
                <div className="w-full md:w-2/3">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative bg-white/[0.10] backdrop-blur-[24px] border border-white/[0.22] rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:border-white/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.18),0_0_30px_rgba(34,245,181,0.25)] transition-all duration-300"
                  >
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: false, amount: 0.35 }}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.12,
                          },
                        },
                      }}
                    >
                      {/* Card Header with Icon */}
                      <motion.div
                        variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                        className="flex items-center gap-4 mb-5 border-b border-black/10 pb-4"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#22F5B5] text-[#111111] flex items-center justify-center shadow-[0_0_18px_rgba(34,245,181,0.45)] shrink-0">
                          <IconComponent className="w-6 h-6 text-[#111111]" />
                        </div>
                        <div>
                          <h4 className="text-lg sm:text-xl font-extrabold text-[#111111]">
                            {item.title}
                          </h4>
                          <span className="text-xs text-[#666666] font-semibold">
                            Phase {item.step} of 10
                          </span>
                        </div>
                      </motion.div>

                      {/* Card Body */}
                      <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}>
                        {item.content}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
