import React from 'react';
import { History, Award, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

export function SessionHistoryList({ sessions, onSelectSession }) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="text-center py-12 border-black/10 shadow-sm">
        <History className="w-12 h-12 text-[#666666] mx-auto mb-3" />
        <h4 className="text-[#111111] font-extrabold text-base">No Previous Interview Sessions</h4>
        <p className="text-[#666666] text-xs mt-1 font-medium">Complete your first AI interview to store persistent scores in LocalStorage.</p>
      </Card>
    );
  }

  return (
    <Card className="border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#111111]" />
          <h3 className="text-lg font-black text-[#111111]">Past Interview Sessions</h3>
        </div>
        <Badge variant="primary">{sessions.length} Saved Sessions</Badge>
      </div>

      <div className="divide-y divide-black/10">
        {sessions.map((sess) => {
          const report = sess.finalReport || {};
          const overallScore = report.overall_score || 0;
          const dateStr = new Date(sess.timestamp).toLocaleString();

          return (
            <div
              key={sess.id}
              className="py-4 flex items-center justify-between hover:bg-[#F6F6F6] px-4 rounded-2xl transition-all cursor-pointer group"
              onClick={() => onSelectSession(sess)}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#111111] text-sm group-hover:text-black transition-colors">
                    Interview Session ({sess.questionList?.length || 15} Questions)
                  </span>
                  <Badge variant={overallScore >= 80 ? 'emerald' : overallScore >= 60 ? 'amber' : 'rose'}>
                    <Award className="w-3 h-3 mr-1" /> {overallScore}% Overall
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#666666] font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {dateStr}
                  </span>
                  {sess.faceMissingCount > 0 && (
                    <span className="flex items-center gap-1 text-red-600 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Face Missing: {sess.faceMissingCount}x
                    </span>
                  )}
                </div>
              </div>

              <Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">
                View Report <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
