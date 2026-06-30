import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Uses Gemini to generate structured issue data from a voice transcript.
 */
export async function processVoiceTranscript(transcript: string): Promise<{
  title: string;
  description: string;
  category: string;
  severity: string;
  department: string;
} | null> {
  if (!API_KEY) return null;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `You are a civic issue classifier. A citizen described an infrastructure problem using voice. Convert their description into a structured report.

Voice transcript: "${transcript}"

Return ONLY valid JSON with this schema:
{
  "title": "<short title, max 60 characters>",
  "description": "<2-3 sentence description>",
  "category": "<one of: pothole, water_leakage, garbage, streetlight, road_hazard, drainage, other>",
  "severity": "<one of: low, medium, high, critical>",
  "department": "<one of: public_works, water_supply, electricity, sanitation, roads, parks, general>"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.error('[VoiceAI] Processing failed:', err);
  }
  return null;
}
