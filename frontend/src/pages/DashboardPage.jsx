import React from 'react';
import { BarChart3, Trash2, ArrowLeft, Play } from 'lucide-react';
import { Button } from '../components/ui';
import { SessionHistoryList } from '../components/dashboard/SessionHistoryList';
import { ScoreCharts } from '../components/dashboard/ScoreCharts';

export function DashboardPage({ sessions, onSelectSession, onClearHistory, onBackToUpload, onResumeInterview, hasActiveInterview }) {
  const latestReport = sessions?.[0]?.finalReport;

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-[#111111]">
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onBackToUpload}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
          </Button>
          {hasActiveInterview && (
            <Button variant="primary" size="sm" onClick={onResumeInterview} className="animate-pulse shadow-md">
              <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Return to Active Interview
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-black text-[#111111] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#111111]" /> Interview Analytics Dashboard
            </h1>
            <p className="text-xs text-[#666666] font-medium">Persistent LocalStorage Session History</p>
          </div>
        </div>

        {sessions?.length > 0 && (
          <Button variant="danger" size="sm" onClick={onClearHistory}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear History
          </Button>
        )}
      </div>

      {latestReport && (
        <ScoreCharts finalReport={latestReport} sessionHistory={sessions} />
      )}

      <SessionHistoryList sessions={sessions} onSelectSession={onSelectSession} />
    </div>
  );
}
