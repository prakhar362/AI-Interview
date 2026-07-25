import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line
} from 'recharts';

export function ScoreCharts({ finalReport, sessionHistory = [] }) {
  if (!finalReport) return null;

  const radarData = [
    { category: 'Technical', score: finalReport.technical_accuracy_score || 0 },
    { category: 'Coding', score: finalReport.coding_score || 0 },
    { category: 'Communication', score: finalReport.communication_score || 0 },
    { category: 'Behavioral', score: finalReport.behavioral_score || 0 },
    { category: 'Project', score: finalReport.project_score || 0 },
  ];

  const trendData = sessionHistory.map((s, idx) => ({
    name: `Session #${idx + 1}`,
    score: s.finalReport?.overall_score || 0,
    date: new Date(s.timestamp).toLocaleDateString(),
  })).reverse();

  return (
    <div className="grid grid-cols-2 gap-4 my-4 w-full">
      {/* Radar Category Breakdown */}
      <div className="border border-[#E0F2FE] bg-white rounded-xl p-4 shadow-sm">
        <h4 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2">
          🎯 Competency Radar
        </h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#E0F2FE" />
              <PolarAngleAxis dataKey="category" stroke="#1E293B" tick={{ fontSize: 10, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748B" tick={false} axisLine={false} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Score Category Bar Chart */}
      <div className="border border-[#E0F2FE] bg-white rounded-xl p-4 shadow-sm">
        <h4 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2">
          📊 Category Scores
        </h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={radarData} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10 }} />
              <YAxis dataKey="category" type="category" stroke="#1E293B" tick={{ fontSize: 10, fontWeight: 600 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0F2FE', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
              />
              <Bar dataKey="score" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Progression Line Chart */}
      {trendData.length > 1 && (
        <div className="col-span-2 border border-[#E0F2FE] bg-white rounded-xl p-4 shadow-sm">
          <h4 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider mb-2 flex items-center gap-2">
            📈 Historical Performance Trend
          </h4>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0F2FE" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E0F2FE', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke="#0F172A" strokeWidth={2} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

