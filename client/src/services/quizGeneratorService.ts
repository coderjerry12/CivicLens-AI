import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation: string;
}

const QUIZ_PROMPT = `You are a quiz generator for a civic awareness and environmental education platform called CivicLens AI. 

Generate exactly 6 unique multiple-choice questions about civic issues, environmental awareness, urban infrastructure, and community responsibility.

Categories to choose from: ♻️ Waste Management, 💧 Water Conservation, 🕳️ Infrastructure, 🌳 Environment, 🏘️ Community, 📋 Civic Reporting

Rules:
- Each question must have exactly 4 options
- Only ONE option is correct (indicated by correctAnswer index 0-3)
- Questions should be educational and factual
- Mix difficulty levels (some easy, some medium, some hard)
- Make questions relevant to Indian urban civic issues when possible
- Explanations should be 1-2 sentences teaching the concept

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
[
  {
    "id": 1,
    "question": "Your question here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "category": "♻️ Waste Management",
    "explanation": "Brief explanation of the correct answer."
  }
]

Generate 6 questions now. Make them DIFFERENT from typical quiz questions - be creative and educational.`;

/**
 * Generates quiz questions using Gemini AI.
 * Returns null if generation fails (caller should use fallback static questions).
 */
export async function generateQuizQuestions(category?: string): Promise<GeneratedQuestion[] | null> {
  if (!API_KEY) {
    console.warn('[QuizGenerator] No API key, using static questions');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = category
      ? `${QUIZ_PROMPT}\n\nIMPORTANT: All 6 questions MUST be about the category: ${category}`
      : QUIZ_PROMPT;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean the response (remove markdown code blocks if present)
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const questions: GeneratedQuestion[] = JSON.parse(cleaned);

    // Validate the response structure
    if (!Array.isArray(questions) || questions.length === 0) {
      console.warn('[QuizGenerator] Invalid response format');
      return null;
    }

    // Validate each question
    const valid = questions.every(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer <= 3 &&
        q.category &&
        q.explanation
    );

    if (!valid) {
      console.warn('[QuizGenerator] Questions failed validation');
      return null;
    }

    // Assign IDs if missing
    return questions.map((q, idx) => ({ ...q, id: idx + 1 }));
  } catch (error) {
    console.error('[QuizGenerator] Generation failed:', error);
    return null;
  }
}
