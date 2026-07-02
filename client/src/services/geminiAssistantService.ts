import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface AssistantContext {
  role: string;
  issueCount: number;
  pendingCount: number;
  resolvedCount?: number;
  inProgressCount?: number;
  userName: string;
}

/**
 * Gemini-powered civic assistant.
 * Maintains context and provides intelligent responses.
 */
export async function getGeminiResponse(
  userMessage: string,
  context: AssistantContext
): Promise<string> {
  if (!API_KEY) {
    return getFallbackResponse(userMessage, context);
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemPrompt = context.role === 'authority'
    ? `You are CivicLens AI assistant for a municipal authority user named ${context.userName}. Platform stats: ${context.issueCount} total issues, ${context.pendingCount} pending, ${context.inProgressCount || 0} in progress, ${context.resolvedCount || 0} resolved. Help them with: issue prioritization, department assignment, analytics, workflow management, SLA tracking, and bulk actions. Keep responses concise (2-3 sentences). Be professional and actionable. Use the real numbers provided.`
    : `You are CivicLens AI assistant for a citizen named ${context.userName}. They have reported ${context.issueCount} issues with ${context.pendingCount} pending and ${context.resolvedCount || 0} resolved. Help them with: reporting issues, tracking status, understanding categories, community verification, and navigating the platform. Keep responses concise (2-3 sentences). Be friendly and helpful. Use the real numbers provided.`;

  try {
    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${userMessage}`);
    return result.response.text();
  } catch {
    return getFallbackResponse(userMessage, context);
  }
}

function getFallbackResponse(message: string, context: AssistantContext): string {
  const msg = message.toLowerCase();
  if (context.role === 'authority') {
    if (msg.includes('pending')) return `You currently have ${context.pendingCount} pending issues that need attention.`;
    if (msg.includes('resolved') || msg.includes('resolution')) return `${context.resolvedCount || 0} issues have been resolved out of ${context.issueCount} total.`;
    if (msg.includes('statistics') || msg.includes('stats')) return `Platform stats: ${context.issueCount} total issues, ${context.pendingCount} pending, ${context.inProgressCount || 0} in progress, ${context.resolvedCount || 0} resolved.`;
    if (msg.includes('department')) return 'You can filter issues by department in the Issue Queue. The AI auto-assigns departments based on issue analysis.';
    if (msg.includes('critical') || msg.includes('priority')) return 'Check the Issue Queue sorted by Priority Score to see critical issues first.';
    if (msg.includes('help')) return 'I can help with issue management, prioritization, analytics, and department assignment.';
    return `I'm here to help manage the platform. You have ${context.issueCount} total issues (${context.pendingCount} pending). Ask me about stats, priorities, or workflows.`;
  }
  if (msg.includes('report') || msg.includes('submit')) return 'To report an issue, go to "Report Issue" in the sidebar. Upload a photo and our AI will categorize it automatically.';
  if (msg.includes('status') || msg.includes('track')) return 'Check "My Issues" to see all your reports with live status updates.';
  if (msg.includes('how many') || msg.includes('reported')) return `You have reported ${context.issueCount} issues so far. ${context.resolvedCount || 0} have been resolved.`;
  if (msg.includes('help')) return 'I can help you report issues, track progress, and navigate the platform.';
  return 'I\'m here to help! Ask about reporting issues, tracking status, categories, or any platform feature.';
}
