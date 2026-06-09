export function speak(text: string, rate = 1): void {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-IN';
  utterance.rate = rate;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  window.speechSynthesis?.cancel();
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}
