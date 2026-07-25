import { useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const speak = useCallback(async (text) => {
    if (!text || !text.trim()) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setIsLoading(true);
    setIsPlaying(false);

    try {
      // Fetch Edge TTS stream from FastAPI backend
      const audioUrl = await api.getAudioStream(text);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = (e) => {
        console.warn('Backend Edge TTS playback failed, falling back to Web Speech Synthesis:', e);
        setIsLoading(false);
        fallbackBrowserTTS(text);
      };

      await audio.play();
    } catch (error) {
      console.warn('Edge TTS API error, using Web Speech API fallback:', error);
      setIsLoading(false);
      fallbackBrowserTTS(text);
    }
  }, []);

  const fallbackBrowserTTS = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}
