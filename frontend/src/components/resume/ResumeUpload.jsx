import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, Badge } from '../ui';
import { FileUpload } from '../ui/file-upload';
import { extractTextFromPDF } from '../../lib/pdfExtract';

export function ResumeUpload({ onResumeParsed, currentResumeText }) {
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(Boolean(currentResumeText));

  const handleFileUpload = async (files) => {
    const file = files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF resume document.');
      return;
    }

    setFileName(file.name);
    setIsParsing(true);
    setError(null);

    try {
      const extractedText = await extractTextFromPDF(file);
      if (!extractedText || extractedText.length < 50) {
        throw new Error('PDF content appears empty or non-text image scan.');
      }
      setIsSuccess(true);
      onResumeParsed(extractedText, file.name);
    } catch (err) {
      setError(err.message || 'Error parsing PDF resume.');
      setIsSuccess(false);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card className="robot-card-hover border-black/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22F5B5]/20 border border-[#22F5B5]/40 flex items-center justify-center text-[#111111] font-bold">
            <FileText className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#111111] text-lg">1. Upload Candidate Resume</h3>
            <p className="text-xs text-[#666666]">Upload PDF resume for personalized AI question synthesis</p>
          </div>
        </div>
        {isSuccess && <Badge variant="primary"><CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#111111]" /> Resume Active</Badge>}
      </div>

      <FileUpload
        onChange={handleFileUpload}
        accept={{ 'application/pdf': ['.pdf'] }}
        maxFiles={1}
      />

      {isParsing && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-[#111111] bg-[#F6F6F6] p-3 rounded-2xl border border-black/5">
          <Loader2 className="w-4 h-4 animate-spin text-[#111111]" />
          <span>Extracting resume text with PDF parser...</span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 text-red-700 text-xs bg-red-50 p-3 rounded-2xl border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </Card>
  );
}
