import React from 'react';
import { CheckCircle2, XCircle, Terminal, Cpu, Lightbulb, Code2 } from 'lucide-react';
import { Card, Badge } from '../ui';

export function CodeReviewPanel({ executionResults, reviewData }) {
  if (!executionResults && !reviewData) return null;

  return (
    <div className="space-y-4 mt-6">
      {/* Execution Results */}
      {executionResults && (
        <Card className="border-black/10 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-black/10 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#111111]" />
              <h4 className="text-sm font-extrabold text-[#111111]">Test Case Execution Output</h4>
            </div>
            <Badge variant={executionResults.passed_count === executionResults.total_count ? 'emerald' : 'rose'}>
              {executionResults.passed_count} / {executionResults.total_count} Passed
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {executionResults.results?.map((res, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  res.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#111111]">Test Case #{idx + 1}</span>
                  {res.passed ? (
                    <span className="flex items-center text-emerald-700 gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Passed</span>
                  ) : (
                    <span className="flex items-center text-red-600 gap-1"><XCircle className="w-3.5 h-3.5" /> Failed</span>
                  )}
                </div>
                <div className="text-[#666666] font-mono">Input: {res.input}</div>
                <div className="text-[#666666] font-mono">Expected: {res.expected_output}</div>
                <div className="text-[#111111] font-mono font-bold">Actual: {res.actual_output}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Code Review */}
      {reviewData && (
        <Card className="border-black/10 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-black/10 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#111111]" />
              <h4 className="text-base font-black text-[#111111]">AI Code Review & Complexity Analysis</h4>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Time: {reviewData.time_complexity}</Badge>
              <Badge variant="amber">Space: {reviewData.space_complexity}</Badge>
              <Badge variant="emerald">Score: {reviewData.score}/100</Badge>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            {reviewData.suggestions && reviewData.suggestions.length > 0 && (
              <div>
                <h5 className="flex items-center gap-1.5 font-black text-amber-900 text-xs mb-2 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-600" /> Optimization & Edge Case Suggestions
                </h5>
                <ul className="list-disc list-inside text-[#666666] space-y-1 text-xs font-medium">
                  {reviewData.suggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}

            {reviewData.optimized_code && (
              <div>
                <h5 className="flex items-center gap-1.5 font-black text-[#111111] text-xs mb-2 uppercase tracking-wider">
                  <Code2 className="w-4 h-4 text-[#111111]" /> Ideal Refactored Solution
                </h5>
                <pre className="bg-[#1e1e1e] border border-black/10 p-3 rounded-2xl text-xs font-mono text-emerald-400 overflow-x-auto">
                  {reviewData.optimized_code}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
