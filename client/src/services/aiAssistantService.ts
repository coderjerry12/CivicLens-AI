/**
 * AI Assistant service — rule-based responses.
 * Designed to be replaceable by Gemini API.
 */

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  'how to report': 'Go to "Report Issue" in the sidebar. Upload a photo, and our AI will help categorize and describe the issue automatically.',
  'track issue': 'Visit "My Issues" to see all your reports. Each has a tracking ID and real-time status updates.',
  'categories': 'We support: Pothole, Water Leakage, Garbage, Streetlight, Road Hazard, Drainage, and more.',
  'resolution time': 'Critical issues: ~12-24 hours. High: ~1-2 days. Medium: ~3 days. Low: ~1 week. Times vary by department.',
  'verification': 'Click "Verify" on any issue in the Community Feed to confirm it exists. This helps authorities prioritize.',
  'notifications': 'You\'ll be notified when your issue status changes, gets assigned, or is resolved.',
};

export function getAssistantResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();

  for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
    if (msg.includes(key)) return response;
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('help')) {
    return 'Hello! I\'m CivicLens AI assistant. I can help you report issues, track progress, understand categories, or navigate the platform. What would you like to know?';
  }

  if (msg.includes('status') || msg.includes('update')) {
    return 'Issue statuses flow: Pending → Assigned → In Progress → Resolved. You get notifications at each step.';
  }

  if (msg.includes('department') || msg.includes('assign')) {
    return 'Issues are assigned to departments based on AI analysis: Roads, Water Supply, Electricity, Sanitation, Parks, or Public Works.';
  }

  return 'I can help with: reporting issues, tracking status, understanding categories, verification, notifications, and more. Try asking about one of these topics!';
}

export function generateAuthorityResponse(userMessage: string, issueCount: number, pendingCount: number): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes('summary') || msg.includes('overview')) {
    return `Current overview: ${issueCount} total issues, ${pendingCount} pending review. The issue queue is accessible from the sidebar.`;
  }

  if (msg.includes('priorit')) {
    return 'Issues are prioritized by: severity (40%), age (25%), AI confidence (20%), and community verifications (15%). Critical + old issues rank highest.';
  }

  if (msg.includes('bulk') || msg.includes('batch')) {
    return 'Select multiple issues from the queue using checkboxes, then use the bulk action bar to assign departments, update status, or change severity in one action.';
  }

  if (msg.includes('analytics') || msg.includes('metrics')) {
    return 'Visit Analytics for KPIs, category trends, department performance, priority distribution, and AI-powered decision recommendations.';
  }

  return 'I can help with: issue summaries, prioritization logic, bulk actions, analytics, department workloads, and workflow management. What do you need?';
}
