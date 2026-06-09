import { useCallback } from 'react';
import { useWealthStore } from '../store/wealthStore';

let lastSpoken = '';
let speakTimeout: ReturnType<typeof setTimeout> | null = null;

export function useVoiceNarration() {
  const accessibilityMode = useWealthStore((s) => s.accessibilityMode);

  const speak = useCallback((text: string) => {
    if (!accessibilityMode) return;
    if (!window.speechSynthesis) return;
    if (text === lastSpoken) return;

    if (speakTimeout) clearTimeout(speakTimeout);

    speakTimeout = setTimeout(() => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
      lastSpoken = text;
    }, 300);
  }, [accessibilityMode]);

  const stopSpeaking = useCallback(() => {
    if (speakTimeout) clearTimeout(speakTimeout);
    window.speechSynthesis?.cancel();
  }, []);

  return { speak, stopSpeaking, enabled: accessibilityMode };
}

export function numberToWords(num: number): string {
  if (num >= 1e7) {
    const crores = num / 1e7;
    return `${crores >= 1 ? Math.floor(crores) : crores.toFixed(2)} crore${crores > 1 ? 's' : ''}`;
  }
  if (num >= 1e5) {
    const lakhs = num / 1e5;
    return `${lakhs >= 1 ? Math.floor(lakhs) : lakhs.toFixed(2)} lakh${lakhs > 1 ? 's' : ''}`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(0)} thousand`;
  }
  return num.toString();
}
