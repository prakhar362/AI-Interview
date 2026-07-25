import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, RefreshCw, AlertTriangle, MessageSquare } from 'lucide-react';
import { Card, Button } from '../ui';
import { useSpeechToText } from '../../hooks/useSpeechToText';

export function VoiceRecorder({ onSubmitAnswer, isSubmitting, onListeningChange }) {
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    setTranscript
  } = useSpeechToText();

  const [textAnswer, setTextAnswer] = useState('');

  // Notify parent of listening state changes
  useEffect(() => {
    if (onListeningChange) {
      onListeningChange(isListening);
    }
  }, [isListening, onListeningChange]);

  useEffect(() => {
    if (transcript) {
      setTextAnswer(transcript);
    }
  }, [transcript]);

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmit = () => {
    if (!textAnswer.trim()) return;
    if (isListening) stopListening();
    onSubmitAnswer(textAnswer);
  };

  return (
    <Card className="border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#111111]" />
          <h4 className="text-sm font-extrabold text-[#111111]">Your Spoken Answer</h4>
        </div>

        <div className="flex items-center gap-2">
          {isListening && (
            <span className="flex items-center gap-1.5 text-xs text-red-600 font-bold animate-pulse bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Recording Mic Spoken Input...
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          rows={5}
          value={textAnswer}
          readOnly={true}
          placeholder={
            isSupported
              ? "Click 'Answer by Voice' and speak your response... your captured words will display here automatically."
              : "Web Speech API not supported in this browser."
          }
          className="w-full bg-[#F6F6F6] border border-black/10 rounded-2xl p-4 text-[#111111] text-sm focus:outline-none transition-all placeholder:text-zinc-400 font-sans cursor-default select-text"
        />

        {error && (
          <div className="flex items-center gap-2 text-amber-900 text-xs bg-amber-50 p-3 rounded-2xl border border-amber-200 font-medium">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isListening ? 'danger' : 'secondary'}
              onClick={toggleRecording}
              disabled={!isSupported || isSubmitting}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-bounce" /> Stop Mic
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#111111]" /> Answer by Voice
                </>
              )}
            </Button>

            {textAnswer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => { setTranscript(''); setTextAnswer(''); }}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!textAnswer.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit Spoken Answer
          </Button>
        </div>
      </div>
    </Card>
  );
}
