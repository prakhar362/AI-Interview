import React, { useEffect } from 'react';
import { Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../ui';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';

export function AIVoicePlayer({ text, autoPlay = true, onPlayingChange }) {
  const { speak, stop, isPlaying, isLoading } = useTextToSpeech();

  // Notify parent of playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying);
    }
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (autoPlay && text) {
      speak(text);
    }
    return () => {
      stop();
    };
  }, [text, autoPlay, speak, stop]);

  return (
    <div className="flex items-center justify-between bg-white border border-black/10 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${isPlaying ? 'bg-[#22F5B5] text-[#111111] animate-pulse shadow-md' : 'bg-[#F6F6F6] text-[#111111] border border-black/5'}`}>
          <Sparkles className="w-4 h-4 text-[#111111]" />
        </div>
        <div>
          <h5 className="text-sm font-extrabold text-[#111111]">AI Voice Interviewer</h5>
          <p className="text-xs text-[#666666] font-medium">
            {isLoading ? 'Synthesizing voice audio...' : isPlaying ? 'Speaking question aloud...' : 'Edge TTS Voice Ready'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPlaying ? (
          <Button variant="danger" size="sm" onClick={stop}>
            <VolumeX className="w-3.5 h-3.5" /> Mute AI
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => speak(text)} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
            Listen Question
          </Button>
        )}
      </div>
    </div>
  );
}
