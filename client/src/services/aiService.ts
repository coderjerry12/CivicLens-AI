import { GoogleGenerativeAI } from '@google/generative-ai';
import { MUNICIPAL_ANALYSIS_PROMPT } from '@/prompts/municipalPrompt';
import { parseAIResponse } from '@/utils/jsonValidator';
import type { AIAnalysisResult } from '@/types/aiAnalysis';

// ─── Initialize Gemini ───

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

function getModel() {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY_MISSING');
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

// ─── Convert data URL to Gemini format ───

function dataURLtoGeminiPart(dataURL: string): { inlineData: { data: string; mimeType: string } } {
  const [meta, base64] = dataURL.split(',');
  const mimeType = meta.match(/:(.*?);/)?.[1] || 'image/jpeg';
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

// ─── Analyze Image ───

export interface AnalyzeOptions {
  imageDataURL: string;
  onStageChange?: (stage: string) => void;
}

/**
 * Analyzes an image using Gemini AI.
 * Retries once if JSON parsing fails.
 * Returns structured AIAnalysisResult or throws a user-friendly error.
 */
export async function analyzeIssueImage(options: AnalyzeOptions): Promise<AIAnalysisResult> {
  const { imageDataURL, onStageChange } = options;

  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const model = getModel();
  const imagePart = dataURLtoGeminiPart(imageDataURL);

  // First attempt
  onStageChange?.('detecting_type');
  let rawText = await callGemini(model, imagePart);

  onStageChange?.('estimating_severity');
  let result = parseAIResponse(rawText);

  // Retry once if parsing failed
  if (!result) {
    console.warn('[AI Service] First attempt failed, retrying...');
    onStageChange?.('detecting_type');
    rawText = await callGemini(model, imagePart);
    result = parseAIResponse(rawText);
  }

  if (!result) {
    throw new Error('AI could not analyze this image. Please try a clearer photo of the issue.');
  }

  onStageChange?.('identifying_department');
  // Small delay for UX staging
  await delay(400);

  onStageChange?.('generating_summary');
  await delay(300);

  onStageChange?.('complete');
  return result;
}

// ─── Internal Helpers ───

async function callGemini(
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  imagePart: { inlineData: { data: string; mimeType: string } }
): Promise<string> {
  try {
    const result = await model.generateContent([MUNICIPAL_ANALYSIS_PROMPT, imagePart]);
    const response = result.response;
    const text = response.text();
    console.log('[AI Service] Raw Gemini response:', text);
    return text;
  } catch (error: unknown) {
    console.error('[AI Service] Gemini API error:', error);
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as Error).message;
      if (message.includes('API_KEY') || message.includes('403') || message.includes('401')) {
        throw new Error('Invalid Gemini API key. Please check your configuration.');
      }
      if (message.includes('SAFETY')) {
        throw new Error('Image was flagged by safety filters. Please upload a different image.');
      }
      if (message.includes('quota') || message.includes('429')) {
        throw new Error('AI service is temporarily busy. Please try again in a moment.');
      }
      if (message.includes('not found') || message.includes('404')) {
        throw new Error('AI model not available. Please try again later.');
      }
    }
    throw new Error('AI analysis failed. Please check your connection and try again.');
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
