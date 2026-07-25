import React, { useState } from 'react';
import { BarChart2, Home, Bot } from 'lucide-react';
import { Button, Badge } from './components/ui';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { InterviewPage } from './pages/InterviewPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // landing, upload, interview, report, dashboard
  const [currentSessionData, setCurrentSessionData] = useState(null);
  const [reportData, setReportData] = useState(null);

  const { sessions, addSession, clearHistory } = useLocalStorage();

  const navigateToLanding = () => {
    setCurrentPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToUpload = () => {
    setCurrentPage('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartInterview = (preparedSession) => {
    setCurrentSessionData(preparedSession);
    setCurrentPage('interview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteInterview = (completedPayload) => {
    addSession(completedPayload);
    setReportData(completedPayload);
    setCurrentPage('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectHistoricalSession = (session) => {
    setReportData(session);
    setCurrentPage('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#ECECEC] text-[#111111] flex flex-col font-sans selection:bg-[#22F5B5]/30">
      {/* Navbar — only on inner pages */}
      {currentPage !== 'landing' && currentPage !== 'upload' && (
        <header className="border-b border-black/10 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={navigateToLanding}
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

            {/* Hide nav buttons during interview — keep them on report/dashboard */}
            {currentPage !== 'interview' && (
              <div className="flex items-center gap-2">
                <Button
                  variant={currentPage === 'landing' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={navigateToLanding}
                >
                  <Home className="w-4 h-4 mr-1" /> Home
                </Button>
                <Button
                  variant={currentPage === 'upload' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={navigateToUpload}
                >
                  Upload Resume
                </Button>
                <Button
                  variant={currentPage === 'dashboard' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentPage('dashboard')}
                >
                  <BarChart2 className="w-4 h-4 mr-1" /> Dashboard ({sessions?.length || 0})
                </Button>
              </div>
            )}
          </div>
        </header>
      )}

      <main className="flex-1 w-full">
        {currentPage === 'landing' && (
          <LandingPage
            onStartInterview={navigateToUpload}
            onStartClick={navigateToUpload}
            sessionsCount={sessions?.length || 0}
            onOpenDashboard={() => setCurrentPage('dashboard')}
          />
        )}

        {currentPage === 'upload' && (
          <UploadPage
            onStartInterview={handleStartInterview}
            onNavigateHome={navigateToLanding}
            onOpenDashboard={() => setCurrentPage('dashboard')}
            sessionsCount={sessions?.length || 0}
          />
        )}

        {currentPage === 'interview' && currentSessionData && (
          <div className="w-full min-h-screen bg-[#ECECEC] py-6">
            <InterviewPage
              sessionData={currentSessionData}
              onCompleteInterview={handleCompleteInterview}
              onNavigateHome={navigateToLanding}
              onNavigateUpload={navigateToUpload}
              onOpenDashboard={() => setCurrentPage('dashboard')}
              sessionsCount={sessions?.length || 0}
            />
          </div>
        )}

        {currentPage === 'report' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <ReportPage
              reportData={reportData}
              sessionHistory={sessions}
              onRestart={navigateToUpload}
              onDashboard={() => setCurrentPage('dashboard')}
            />
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <DashboardPage
              sessions={sessions}
              onSelectSession={handleSelectHistoricalSession}
              onNewSession={navigateToUpload}
              onBackToUpload={navigateToLanding}
              onClearHistory={clearHistory}
            />
          </div>
        )}
      </main>

      {/* Footer only on inner pages */}
      {currentPage !== 'landing' && (
        <footer className="border-t border-black/10 bg-[#F6F6F6] py-6 text-center text-xs text-[#666666] font-medium">
          AI Interviewer OS &copy; {new Date().getFullYear()} &bull; Powered by Gemini 2.5, Edge TTS, Monaco & MediaPipe
        </footer>
      )}
    </div>
  );
}
