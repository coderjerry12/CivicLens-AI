/**
 * Voice-to-text service using the Web Speech API.
 * Falls back gracefully if not supported.
 */

export interface VoiceResult {
  transcript: string;
  confidence: number;
}

export function isVoiceSupported(): boolean {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export function startVoiceRecognition(
  onResult: (result: VoiceResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { stop: () => void } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionClass) {
    onError('Voice recognition is not supported in your browser.');
    onEnd();
    return { stop: () => {} };
  }

  const recognition = new SpeechRecognitionClass();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN';

  recognition.onresult = (event: { results: { 0: { 0: { transcript: string; confidence: number } } } }) => {
    const result = event.results[0][0];
    onResult({ transcript: result.transcript, confidence: result.confidence });
  };

  recognition.onerror = (event: { error: string }) => {
    switch (event.error) {
      case 'not-allowed':
        onError('Microphone permission denied. Please allow microphone access.');
        break;
      case 'no-speech':
        onError('No speech detected. Please try again.');
        break;
      case 'network':
        onError('Network error. Please check your connection.');
        break;
      default:
        onError('Voice recognition failed. Please try again.');
    }
  };

  recognition.onend = onEnd;
  recognition.start();

  return { stop: () => recognition.stop() };
}
