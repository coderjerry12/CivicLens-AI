import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Gemini-powered civic assistant.
 * Maintains context and provides intelligent responses.
 */
export async function getGeminiResponse(
  userMessage: string,
  context: { role: string; issueCount: number; pendingCount: number; userName: string }
): Promise<string> {
  if (!API_KEY) {
    return getFallbackResponse(userMessage, context.role);
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemPrompt = context.role === 'authority'
    ? `You are CivicLens AI assistant for a municipal authority user named ${context.userName}. They manage ${context.issueCount} total issues with ${context.pendingCount} pending. Help them with: issue prioritization, department assignment, analytics, workflow management, SLA tracking, and bulk actions. Keep responses concise (2-3 sentences). Be professional and actionable.`
    : `You are CivicLens AI assistant for a citizen named ${context.userName}. They have reported ${context.issueCount} issues. Help them with: reporting issues, tracking status, understanding categories, community verification, and navigating the platform. Keep responses concise (2-3 sentences). Be friendly and helpful.`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${userMessage}`);
    return result.response.text();
  } catch {
    return getFallbackResponse(userMessage, context.role);
  }
}

function getFallbackResponse(message: string, role: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('report') || msg.includes('submit')) return 'To report an issue, go to "Report Issue" in the sidebar. Upload a photo and our AI will categorize it automatically.';
  if (msg.includes('status') || msg.includes('track')) return 'Check "My Issues" to see all your reports with live status updates.';
  if (msg.includes('help')) return role === 'authority' ? 'I can help with issue management, prioritization, analytics, and department assignment.' : 'I can help you report issues, track progress, and navigate the platform.';
  return 'I\'m here to help! Ask about reporting issues, tracking status, categories, or any platform feature.';
}
