import React, { useState } from 'react';
import { Briefcase, CheckCircle2, FileUp, Loader2 } from 'lucide-react';
import { Card, Badge } from '../ui';
import { extractTextFromPDF } from '../../lib/pdfExtract';

export function JDUpload({ onJDParsed, currentJDText }) {
  const [jdText, setJdText] = useState(currentJDText || '');
  const [isParsing, setIsParsing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(Boolean(currentJDText));

  const handleTextChange = (e) => {
    const text = e.target.value;
    setJdText(text);
    setIsSuccess(Boolean(text.trim()));
    onJDParsed(text);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      let extracted = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        extracted = await extractTextFromPDF(file);
      } else {
        extracted = await file.text();
      }
      setJdText(extracted);
      setIsSuccess(true);
      onJDParsed(extracted);
    } catch (err) {
      console.error('JD parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card className="robot-card-hover border-black/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22F5B5]/20 border border-[#22F5B5]/40 flex items-center justify-center text-[#111111] font-bold">
            <Briefcase className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#111111] text-lg">2. Target Job Description <span className="text-xs text-[#666666] font-normal">(Optional)</span></h3>
            <p className="text-xs text-[#666666]">Paste job requirements or upload JD document to tailor questions</p>
          </div>
        </div>
        {isSuccess && <Badge variant="primary"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> JD Active</Badge>}
      </div>

      <div className="space-y-3">
        <textarea
          rows={4}
          value={jdText}
          onChange={handleTextChange}
          placeholder="Paste key responsibilities, qualifications, and tech stack requirements here..."
          className="w-full bg-[#F6F6F6] border border-black/10 rounded-2xl p-3 text-sm text-[#111111] focus:outline-none focus:border-[#22F5B5] focus:bg-white transition-all placeholder:text-zinc-400"
        />

        <div className="flex items-center justify-between text-xs text-[#666666]">
          <span>Or upload file:</span>
          <label className="inline-flex items-center gap-1.5 text-[#111111] hover:text-black cursor-pointer font-bold bg-[#F6F6F6] hover:bg-zinc-200 px-3 py-1.5 rounded-full border border-black/5 transition-all">
            {isParsing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
            Upload PDF/TXT file
            <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>
    </Card>
  );
}
