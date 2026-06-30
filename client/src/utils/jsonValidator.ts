import type { AIAnalysisResult, AICategory, AISeverity, AIDepartment } from '@/types/aiAnalysis';

/**
 * Validates and parses AI analysis JSON response.
 * Returns a typed result or null if validation fails.
 */

const VALID_CATEGORIES: AICategory[] = [
  'pothole', 'water_leakage', 'garbage', 'streetlight',
  'road_hazard', 'drainage', 'noise', 'other',
];

const VALID_SEVERITIES: AISeverity[] = ['low', 'medium', 'high', 'critical'];

const VALID_DEPARTMENTS: AIDepartment[] = [
  'public_works', 'water_supply', 'electricity',
  'sanitation', 'roads', 'parks', 'general',
];

/**
 * Extracts JSON from a string that may contain markdown code blocks or extra text.
 */
function extractJSON(text: string): string {
  // Try to find JSON in code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Try to find a JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }

  return text.trim();
}

/**
 * Parses and validates the AI response into a typed AIAnalysisResult.
 * Returns null if the response is invalid.
 */
export function parseAIResponse(rawText: string): AIAnalysisResult | null {
  try {
    const jsonString = extractJSON(rawText);
    const parsed = JSON.parse(jsonString);

    // Validate required fields exist
    if (!parsed.category || !parsed.severity || !parsed.department || !parsed.title || !parsed.description) {
      console.warn('[AI Validator] Missing required fields:', parsed);
      return null;
    }

    // Validate enum values
    const category = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'other';

    const severity = VALID_SEVERITIES.includes(parsed.severity)
      ? parsed.severity
      : 'medium';

    const department = VALID_DEPARTMENTS.includes(parsed.department)
      ? parsed.department
      : 'general';

    // Validate confidence
    const confidence = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
      : 50;

    // Validate strings
    const title = typeof parsed.title === 'string'
      ? parsed.title.slice(0, 80)
      : 'Infrastructure Issue Detected';

    const description = typeof parsed.description === 'string'
      ? parsed.description.slice(0, 500)
      : 'An infrastructure issue was detected in the uploaded image.';

    return {
      category,
      severity,
      department,
      title,
      description,
      confidence,
    };
  } catch (error) {
    console.warn('[AI Validator] JSON parse failed:', error);
    return null;
  }
}
