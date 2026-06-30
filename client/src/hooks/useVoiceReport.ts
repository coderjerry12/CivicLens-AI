import { useState, useCallback } from 'react';
import { isVoiceSupported, startVoiceRecognition } from '@/services/voiceService';
import { processVoiceTranscript } from '@/services/voiceAIService';

export interface VoiceReportData {
  title: string;
  description: string;
  category: string;
  severity: string;
  department: string;
}

interface VoiceReportState {
  supported: boolean;
  recording: boolean;
  processing: boolean;
  transcript: string | null;
  result: VoiceReportData | null;
  error: string | null;
}

/**
 * Hook for voice-based issue reporting.
 */
export function useVoiceReport() {
  const [state, setState] = useState<VoiceReportState>({
    supported: isVoiceSupported(),
    recording: false,
    processing: false,
    transcript: null,
    result: null,
    error: null,
  });

  const startRecording = useCallback(() => {
    setState((s) => ({ ...s, recording: true, error: null, transcript: null, result: null }));

    startVoiceRecognition(
      async (voiceResult) => {
        setState((s) => ({ ...s, recording: false, processing: true, transcript: voiceResult.transcript }));

        const aiResult = await processVoiceTranscript(voiceResult.transcript);
        if (aiResult) {
          setState((s) => ({ ...s, processing: false, result: aiResult }));
        } else {
          setState((s) => ({ ...s, processing: false, error: 'Could not process voice input. Please try again or type manually.' }));
        }
      },
      (error) => {
        setState((s) => ({ ...s, recording: false, processing: false, error }));
      },
      () => {
        setState((s) => ({ ...s, recording: false }));
      }
    );
  }, []);

  const reset = useCallback(() => {
    setState({ supported: isVoiceSupported(), recording: false, processing: false, transcript: null, result: null, error: null });
  }, []);

  return { ...state, startRecording, reset };
}
