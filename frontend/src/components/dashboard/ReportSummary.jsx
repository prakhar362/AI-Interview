import React from 'react';
import { ScoreCharts } from './ScoreCharts';
import { 
  CheckCircle2, AlertTriangle, Lightbulb, FileText, UserX, Award, ShieldCheck, ChevronRight
} from 'lucide-react';

const PageWrapper = ({ children, pageNum, totalPages, candidateName }) => (
  <div className="pdf-page w-[210mm] h-[297mm] bg-white relative flex flex-col shrink-0 mx-auto mb-8 shadow-sm overflow-hidden" style={{ padding: '40px 50px' }}>
    {/* Page Header */}
    <div className="flex items-end justify-between border-b border-[#2563EB]/20 pb-3 mb-8 shrink-0">
      <div className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest">AI Interviewer OS</div>
      <div className="text-[12px] font-semibold text-[#0F172A]">Candidate Performance & Assessment Report</div>
      <div className="text-[10px] font-medium text-[#64748B]">{new Date().toLocaleDateString()}</div>
    </div>
    
    {/* Main Content */}
    <div className="flex-1 flex flex-col">
      {children}
    </div>

    {/* Page Footer */}
    <div className="flex items-center justify-between border-t border-[#2563EB]/20 pt-4 mt-8 shrink-0">
      <div className="text-[10px] font-medium text-[#1E293B]">Candidate: <span className="font-bold">{candidateName}</span></div>
      <div className="text-[10px] font-semibold text-[#2563EB] bg-[#F0F7FF] px-2 py-0.5 rounded">CONFIDENTIAL</div>
      <div className="text-[10px] font-medium text-[#64748B]">Page {pageNum} of {totalPages}</div>
    </div>
  </div>
);

export function ReportSummary({ finalReport, candidateName = 'Candidate', sessionHistory = [] }) {
  if (!finalReport) return null;

  const qaItems = finalReport.ideal_answers || [];
  const qaPages = [];
  const ITEMS_PER_PAGE = 2; // Fit safely within A4
  for (let i = 0; i < qaItems.length; i += ITEMS_PER_PAGE) {
    qaPages.push(qaItems.slice(i, i + ITEMS_PER_PAGE));
  }

  // Base pages (Page 1: Overview, Page 2: Roadmap) + Q&A Pages
  const totalPages = 2 + qaPages.length;

  return (
    <div id="interview-report-content" className="bg-white text-[#1E293B] font-sans flex flex-col">
      
      {/* PAGE 1: Overview & Score Dashboard */}
      <PageWrapper pageNum={1} totalPages={totalPages} candidateName={candidateName}>
        {/* Document Title Header */}
        <div className="pb-6 flex items-end justify-between border-b border-[#E0F2FE]">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#2563EB] uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Official Assessment Record
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Executive Candidate Report</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#0F172A]">{candidateName}</div>
            <div className="text-[11px] font-medium text-[#64748B]">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="py-8 flex gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Overall Performance Score</h2>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-black text-[#0F172A] tracking-tighter">{finalReport.overall_score ?? 0}%</span>
                <span className={`px-4 py-1.5 rounded-sm text-sm font-bold ${finalReport.overall_score >= 80 ? 'bg-[#F0F7FF] text-[#2563EB] border border-[#BFDBFE]' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                  {finalReport.overall_score >= 80 ? 'Hire Recommended' : 'Further Review Needed'}
                </span>
              </div>
            </div>
            
            {/* Executive Summary Callout */}
            <div className="bg-[#F0F7FF] border-l-4 border-[#2563EB] p-5 rounded-r-lg">
              <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider mb-2">Executive Summary</h3>
              <p className="text-sm text-[#1E293B] leading-relaxed font-medium">
                {finalReport.summary}
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="w-56 shrink-0 grid grid-cols-1 gap-4">
            <div className="border border-[#E0F2FE] bg-white p-4 rounded-lg shadow-sm">
              <Award className="w-6 h-6 text-[#2563EB] mb-2" />
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Assessed Level</div>
              <div className="text-lg font-black text-[#0F172A]">
                {finalReport.overall_score >= 90 ? 'Senior' : finalReport.overall_score >= 75 ? 'Mid-Level' : 'Junior'}
              </div>
            </div>
            {/* Proctoring Card — shows actual face-missing count prominently */}
            <div className={`border p-4 rounded-lg shadow-sm ${(finalReport.face_missing_count || 0) > 2 ? 'border-red-300 bg-red-50' : 'border-[#E0F2FE] bg-white'}`}>
              <UserX className={`w-6 h-6 mb-2 ${(finalReport.face_missing_count || 0) > 2 ? 'text-red-500' : 'text-[#2563EB]'}`} />
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Proctoring</div>
              <div className={`text-2xl font-black mt-1 ${(finalReport.face_missing_count || 0) > 2 ? 'text-red-600' : 'text-[#0F172A]'}`}>
                {finalReport.face_missing_count || 0}
                <span className="text-sm font-semibold ml-1">{finalReport.face_missing_count === 1 ? 'time' : 'times'}</span>
              </div>
              <div className="text-[10px] font-medium text-[#64748B] mt-1">face absent from webcam</div>
              <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded inline-block ${
                (finalReport.face_missing_count || 0) === 0 ? 'bg-emerald-100 text-emerald-700'
                : (finalReport.face_missing_count || 0) <= 2  ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'}`}>
                {(finalReport.face_missing_count || 0) === 0 ? '✓ No violations'
                  : (finalReport.face_missing_count || 0) <= 2 ? '⚠ Minor concern'
                  : '✗ Flagged'}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown Dashboard */}
        <div className="py-6 border-t border-[#E0F2FE] flex-1">
          <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider mb-4">Performance Dimension Dashboard</h3>
          <div className="scale-95 origin-top w-[105%] flex justify-center">
            <ScoreCharts finalReport={finalReport} sessionHistory={sessionHistory} />
          </div>
        </div>
      </PageWrapper>

      {/* PAGE 2: Strengths, Weaknesses, and Roadmap */}
      <PageWrapper pageNum={2} totalPages={totalPages} candidateName={candidateName}>
        {/* Modular Two-Column Layout */}
        <div className="py-6 grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E0F2FE] pb-2">
              <CheckCircle2 className="w-4 h-4 text-[#2563EB]" /> Key Strengths
            </h3>
            <ul className="space-y-3">
              {finalReport.strengths?.map((str, i) => (
                <li key={i} className="relative pl-5 text-sm text-[#1E293B]">
                  <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <span className="leading-snug">{str}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E0F2FE] pb-2">
              <AlertTriangle className="w-4 h-4 text-[#0F172A]" /> Areas for Growth
            </h3>
            <ul className="space-y-3">
              {finalReport.weaknesses?.map((wk, i) => (
                <li key={i} className="relative pl-5 text-sm text-[#1E293B]">
                  <div className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-[#0F172A]" />
                  <span className="leading-snug">{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Proctoring Summary Row */}
        <div className={`mt-2 mb-6 flex items-center gap-4 px-5 py-4 rounded-lg border text-sm font-medium ${
          (finalReport.face_missing_count || 0) === 0
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : (finalReport.face_missing_count || 0) <= 2
            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <UserX className="w-5 h-5 flex-shrink-0" />
          <span>
            <strong>Proctoring Note:</strong>{' '}
            {(finalReport.face_missing_count || 0) === 0
              ? 'The candidate was present in frame throughout the entire interview session. No proctoring violations detected.'
              : (finalReport.face_missing_count || 0) === 1
              ? 'The candidate\'s face was absent from the webcam 1 time during the session. This may indicate a brief distraction.'
              : `The candidate's face was absent from the webcam ${finalReport.face_missing_count} times during the session. ${(finalReport.face_missing_count || 0) > 2 ? 'This has been flagged for review.' : 'Minor concern noted.'}`}
          </span>
        </div>

        {/* Actionable Development Plan */}
        {finalReport.learning_roadmap && finalReport.learning_roadmap.length > 0 && (
          <div className="py-8 mt-6">
            <div className="border border-[#E0F2FE] rounded-xl p-6 bg-white shadow-sm">
              <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 mb-6">
                <Lightbulb className="w-4 h-4 text-[#2563EB]" /> Actionable Development Roadmap
              </h3>
              <div className="relative pl-10 space-y-6">
                <div className="absolute left-[11.5px] top-2 bottom-2 w-px bg-[#E0F2FE]" />
                
                {finalReport.learning_roadmap.slice(0, 5).map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-10 top-0 w-6 h-6 rounded-full bg-[#F0F7FF] border border-[#2563EB] text-[#2563EB] text-center leading-[22px] box-border text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm font-medium text-[#1E293B] pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageWrapper>

      {/* PAGE 3+: Q&A Sections Chunked */}
      {qaPages.map((pageQuestions, pageIndex) => (
        <PageWrapper key={pageIndex} pageNum={3 + pageIndex} totalPages={totalPages} candidateName={candidateName}>
          <div className="py-6 space-y-8">
            <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 border-b border-[#E0F2FE] pb-2">
              <FileText className="w-4 h-4 text-[#2563EB]" /> Technical & Behavioral Review (Pt {pageIndex + 1})
            </h3>
            
            <div className="space-y-6">
              {pageQuestions.map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E0F2FE] rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-[#F8FAFC] px-5 py-4 border-b border-[#E0F2FE]">
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Question</div>
                    <div className="text-sm font-bold text-[#0F172A]">{item.question}</div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div>
                      <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <UserX className="w-3 h-3" /> Candidate Response
                      </div>
                      <p className="text-sm text-[#334155] leading-relaxed pl-4 border-l-2 border-gray-200">
                        {item.user_answer}
                      </p>
                    </div>
                    
                    <div className="bg-[#F0F7FF] p-4 rounded-md border border-[#BFDBFE]">
                      <div className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ideal/Model Response
                      </div>
                      <p className="text-sm text-[#1E3A8A] font-medium leading-relaxed">
                        {item.ideal_answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageWrapper>
      ))}

    </div>
  );
}

