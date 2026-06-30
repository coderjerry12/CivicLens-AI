import { useState, useCallback } from 'react';
import { getGeminiResponse } from '@/services/geminiAssistantService';
import { useAuth } from '@/features/auth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import type { AssistantMessage } from '@/services/aiAssistantService';

/**
 * Hook for the floating AI assistant — now powered by Gemini.
 */
export function useAIAssistant() {
  const { user } = useAuth();
  const { stats } = useDashboardStats();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: '0', role: 'assistant', content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! I'm your CivicLens AI assistant. How can I help you today?`, timestamp: new Date() },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AssistantMessage = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await getGeminiResponse(content, {
        role: user?.role || 'citizen',
        issueCount: stats?.totalReports || 0,
        pendingCount: stats?.pending || 0,
        userName: user?.displayName || 'User',
      });

      const assistantMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date(),
      }]);
    }
    setIsTyping(false);
  }, [user, stats]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { messages, isOpen, isTyping, sendMessage, toggle, close };
}
