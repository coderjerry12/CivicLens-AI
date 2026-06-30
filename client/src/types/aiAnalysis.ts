/**
 * Types for Gemini AI image analysis results.
 */

export interface AIAnalysisResult {
  category: AICategory;
  severity: AISeverity;
  department: AIDepartment;
  title: string;
  description: string;
  confidence: number; // 0-100
}

export type AICategory =
  | 'pothole'
  | 'water_leakage'
  | 'garbage'
  | 'streetlight'
  | 'road_hazard'
  | 'drainage'
  | 'noise'
  | 'other';

export type AISeverity = 'low' | 'medium' | 'high' | 'critical';

export type AIDepartment =
  | 'public_works'
  | 'water_supply'
  | 'electricity'
  | 'sanitation'
  | 'roads'
  | 'parks'
  | 'general';

export interface AIAnalysisState {
  status: 'idle' | 'analyzing' | 'success' | 'error';
  result: AIAnalysisResult | null;
  error: string | null;
  stage: AIAnalysisStage;
}

export type AIAnalysisStage =
  | 'idle'
  | 'detecting_type'
  | 'estimating_severity'
  | 'identifying_department'
  | 'generating_summary'
  | 'complete';
