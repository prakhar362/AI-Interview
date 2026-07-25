import React, { useState } from 'react';
import { ArrowRight, Loader2, Award, Briefcase, Bot, Home, BarChart2 } from 'lucide-react';
import { Badge, Button } from '../components/ui';
import { ResumeUpload } from '../components/resume/ResumeUpload';
import { JDUpload } from '../components/resume/JDUpload';
import { api } from '../lib/api';

export function UploadPage({ onStartInterview, onNavigateHome, onOpenDashboard, sessionsCount = 0 }) {
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [jdAnalysis, setJdAnalysis] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleResumeParsed = async (extractedText, filename) => {
    setResumeText(extractedText);
    setResumeFileName(filename || 'Resume.pdf');
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeResume(extractedText);
      setResumeAnalysis(res);
    } catch (err) {
      console.error('Resume analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleJDParsed = async (extractedText) => {
    setJdText(extractedText);
    if (!extractedText || !extractedText.trim()) {
      setJdAnalysis(null);
      return;
    }
    try {
      const res = await api.analyzeJD(extractedText, resumeText);
      setJdAnalysis(res);
    } catch (err) {
      console.error('JD analysis failed:', err);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!resumeText) return;
    setIsGenerating(true);
    try {
      const questionData = await api.generateQuestions(resumeText, jdText);
      onStartInterview({
        resumeText,
        jdText,
        resumeAnalysis,
        jdAnalysis,
        questions: questionData.questions,
      });
    } catch (err) {
      console.error('Question generation failed:', err);
      alert('Error generating questions from Gemini API. Check your backend server and API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#ECECEC] text-[#111111] font-sans flex flex-col selection:bg-[#22F5B5]/30 relative overflow-hidden">
      {/* Subtle Ambient Soft Mint & Light Blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-[#22F5B5]/05 rounded-full blur-3xl" />
        <div className="absolute bottom-12 left-1/4 w-96 h-96 bg-white/40 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-black/10 bg-white/70 backdrop-blur-md sticky top-0 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={onNavigateHome}
          >
            <div className="w-9 h-9 rounded-2xl bg-[#22F5B5] text-[#111111] flex items-center justify-center font-black shadow-[0_4px_14px_rgba(34,245,181,0.35)] transition-transform group-hover:scale-105">
              <Bot className="w-5 h-5 text-[#111111]" />
            </div>
            <div>
              <h2 className="font-black text-[#111111] text-base tracking-tight flex items-center gap-2">
                AI Interviewer OS
                <Badge variant="primary" className="text-[10px] px-2 py-0.5">V1.0</Badge>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateHome}
              className="rounded-full bg-white/80 border border-black/10 hover:bg-white text-xs font-bold"
            >
              <Home className="w-4 h-4 mr-1.5" /> Home Landing
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenDashboard}
              className="rounded-full bg-white/80 border border-black/10 hover:bg-white text-xs font-bold"
            >
              <BarChart2 className="w-4 h-4 mr-1.5" /> Dashboard ({sessionsCount})
            </Button>
          </div>
        </div>
      </header>

      {/* Main Upload Content Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-12 sm:py-16 space-y-10">
        {/* Top Heading */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Upload Candidate Materials
          </h1>
          <p className="text-[#444444] text-base sm:text-lg font-medium leading-relaxed">
            Provide your resume (and optional job description) to generate customized AI interview questions.
          </p>
        </div>

        {/* Two Column Layout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ResumeUpload onResumeParsed={handleResumeParsed} currentResumeText={resumeText} />
          <JDUpload onJDParsed={handleJDParsed} currentJDText={jdText} />
        </div>

        {/* Profile Analysis Preview */}
        {isAnalyzing && (
          <div className="relative bg-white/50 backdrop-blur-[24px] border border-white/80 rounded-[28px] p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-3">
            <Loader2 className="w-8 h-8 text-[#111111] animate-spin mx-auto" />
            <p className="text-base font-bold text-[#111111]">Gemini is analyzing candidate background & skills...</p>
          </div>
        )}

        {resumeAnalysis && (
          <div className="relative bg-white/50 backdrop-blur-[24px] border border-white/80 rounded-[28px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#111111]" />
                <h3 className="font-extrabold text-[#111111] text-lg">Candidate Profile Analysis</h3>
              </div>
              <Badge variant="primary">{resumeAnalysis.experience_years} Years Experience</Badge>
            </div>

            <p className="text-sm text-[#444444] font-medium leading-relaxed">{resumeAnalysis.summary}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              {resumeAnalysis.skills?.map((skill, idx) => (
                <Badge key={idx} variant="default" className="bg-white/80 text-[#111111] border border-black/10 font-bold">
                  {skill}
                </Badge>
              ))}
            </div>

            {jdAnalysis && (
              <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[#111111] font-bold">
                  <Briefcase className="w-4 h-4 text-[#00c993]" />
                  <span>Job Fit Score: <strong className="text-black">{jdAnalysis.fit_score}%</strong></span>
                </div>
                <span className="text-[#555555] font-semibold">Role: {jdAnalysis.role_title}</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Centered CTA Button */}
        <div className="flex justify-center pt-6">
          <button
            onClick={handleGenerateQuestions}
            disabled={!resumeText || isGenerating}
            className={`w-full max-w-[480px] py-4 px-8 text-lg sm:text-xl font-black rounded-full shadow-[0_4px_25px_rgba(34,245,181,0.4)] transition-all duration-300 flex items-center justify-center gap-3 border border-[#22F5B5]/40 ${
              !resumeText || isGenerating
                ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none opacity-60'
                : 'bg-[#22F5B5] text-[#111111] hover:shadow-[0_0_40px_rgba(34,245,181,0.8)] hover:scale-[1.02] cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Generating Personal Questions...</span>
              </>
            ) : (
              <>
                <span>Start Mock Interview Session</span>
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
