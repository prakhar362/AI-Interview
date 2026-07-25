import React from 'react';
import { Code2 } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript (Node.js)' },
  { id: 'python', label: 'Python 3' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'cpp', label: 'C++ 20' },
  { id: 'java', label: 'Java' },
];

export function LanguageSelector({ language, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-[#F6F6F6] border border-black/10 px-3.5 py-1.5 rounded-full text-xs">
      <Code2 className="w-4 h-4 text-[#111111]" />
      <span className="text-[#666666] font-bold">Language:</span>
      <select
        value={language}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-[#111111] font-bold focus:outline-none cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id} className="bg-white text-[#111111]">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
