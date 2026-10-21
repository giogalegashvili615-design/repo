import { useCallback, useEffect, useState } from 'react';

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const speak = useCallback(
    (text: string, messageId: string, preferredVoiceName?: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();

      // Strip markdown code fences, urls, and special formatting for natural audio
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/[*_~]/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      if (preferredVoiceName) {
        const found = voices.find((v) => v.name === preferredVoiceName);
        if (found) utterance.voice = found;
      } else {
        const naturalVoice = voices.find(
          (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.lang.startsWith('en')) && !v.name.includes('Bad')
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setActiveMessageId(messageId);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setActiveMessageId(null);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [voices]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setActiveMessageId(null);
    }
  }, []);

  return {
    isPlaying,
    activeMessageId,
    voices,
    speak,
    stop,
  };
}
