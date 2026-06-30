import { useState, useCallback, useRef } from 'react';
import { analyzeIssueImage } from '@/services/aiService';
import type { AIAnalysisState, AIAnalysisStage } from '@/types/aiAnalysis';

/**
 * Hook for AI image analysis using Gemini.
 * Manages analysis state, progress stages, and retry logic.
 *
 * Usage:
 * const { analysisState, analyze, retry, reset } = useAIAnalysis();
 * analyze(imageDataURL);
 * // analysisState.result contains the typed analysis
 */
export function useAIAnalysis() {
  const [analysisState, setAnalysisState] = useState<AIAnalysisState>({
    status: 'idle',
    result: null,
    error: null,
    stage: 'idle',
  });

  const lastImageRef = useRef<string | null>(null);
  const abortRef = useRef(false);

  const analyze = useCallback(async (imageDataURL: string) => {
    // Prevent duplicate calls
    if (analysisState.status === 'analyzing') return;

    lastImageRef.current = imageDataURL;
    abortRef.current = false;

    setAnalysisState({
      status: 'analyzing',
      result: null,
      error: null,
      stage: 'detecting_type',
    });

    try {
      const result = await analyzeIssueImage({
        imageDataURL,
        onStageChange: (stage) => {
          if (!abortRef.current) {
            setAnalysisState((prev) => ({
              ...prev,
              stage: stage as AIAnalysisStage,
            }));
          }
        },
      });

      if (abortRef.current) return;

      console.log('[AI Analysis] Result:', result);

      setAnalysisState({
        status: 'success',
        result,
        error: null,
        stage: 'complete',
      });
    } catch (error: unknown) {
      if (abortRef.current) return;

      const message = error instanceof Error
        ? error.message
        : 'AI analysis failed. Please try again.';

      setAnalysisState({
        status: 'error',
        result: null,
        error: message,
        stage: 'idle',
      });
    }
  }, [analysisState.status]);

  const retry = useCallback(() => {
    if (lastImageRef.current) {
      analyze(lastImageRef.current);
    }
  }, [analyze]);

  const reset = useCallback(() => {
    abortRef.current = true;
    lastImageRef.current = null;
    setAnalysisState({
      status: 'idle',
      result: null,
      error: null,
      stage: 'idle',
    });
  }, []);

  return {
    analysisState,
    analyze,
    retry,
    reset,
  };
}
