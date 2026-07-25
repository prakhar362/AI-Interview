import React from 'react';
import { ReportSummary } from '../components/dashboard/ReportSummary';
import { Button } from '../components/ui';
import { Download, CheckCircle } from 'lucide-react';
import { exportReportToPDF } from '../lib/pdfReportExport';

export function ReportPage({ reportData, sessionHistory, onRestart, onDashboard }) {
  if (!reportData) return null;

  const candidateName = reportData.candidateName || 'Candidate';

  const handleDownloadPDF = async () => {
    const el = document.getElementById('interview-report-content');
    if (!el) {
      alert('Report content not found. Please wait for the page to fully load.');
      return;
    }
    try {
      await exportReportToPDF('interview-report-content', candidateName);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF download failed. Please try again.');
    }
  };

  const handleDashboard = () => {
    if (onDashboard) {
      onDashboard();
    } else if (onRestart) {
      onRestart();
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto flex flex-col items-center">
      {/* Thank You Banner */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-black/10 p-8 mb-10 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">
          Thank you for completing the interview!
        </h1>
        <p className="text-[#64748B] mb-8 max-w-lg">
          Your responses have been evaluated and your personalized executive report is ready. You can download the official PDF below or preview it on this page.
        </p>
        
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={handleDashboard}>
            Return to Dashboard
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF} className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white border-transparent">
            <Download className="w-4 h-4 mr-2" /> Download Report (PDF)
          </Button>
        </div>
      </div>

      {/* Report Preview Container */}
      <div className="w-full max-w-6xl mx-auto bg-[#F0F7FF]/30 p-4 md:p-8 rounded-3xl border border-[#E0F2FE] overflow-x-auto">
        <div className="flex items-center justify-between mb-4 min-w-[210mm]">
          <h2 className="text-lg font-bold text-[#1E293B]">Report Preview</h2>
          <span className="text-xs font-medium text-[#64748B]">A4 Format</span>
        </div>
        
        <div className="w-max mx-auto shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div id="interview-report-content">
            <ReportSummary
              finalReport={reportData.finalReport}
              candidateName={candidateName}
              sessionHistory={sessionHistory}
              onRestart={onRestart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
