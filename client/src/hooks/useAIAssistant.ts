import { useState, useCallback, useEffect } from 'react';
import { getGeminiResponse } from '@/services/geminiAssistantService';
import { useAuth } from '@/features/auth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AssistantMessage } from '@/services/aiAssistantService';

/**
 * Hook for the floating AI assistant — now powered by Gemini.
 */
export function useAIAssistant() {
  const { user } = useAuth();
  const { stats } = useDashboardStats();
  const [authorityStats, setAuthorityStats] = useState<{ total: number; pending: number; resolved: number; inProgress: number } | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: '0', role: 'assistant', content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! I'm your CivicLens AI assistant. How can I help you today?`, timestamp: new Date() },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch all issues stats for authority users
  useEffect(() => {
    if (user?.role !== 'authority') return;
    async function fetchAll() {
      try {
        const snap = await getDocs(collection(db, 'issues'));
        let total = 0, pending = 0, resolved = 0, inProgress = 0;
        snap.forEach((d) => {
          const s = d.data().status;
          total++;
          if (s === 'pending' || s === 'validated') pending++;
          else if (s === 'in_progress') inProgress++;
          else if (s === 'resolved' || s === 'closed') resolved++;
        });
        setAuthorityStats({ total, pending, resolved, inProgress });
      } catch { /* ignore */ }
    }
    fetchAll();
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AssistantMessage = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Use authority stats if authority, else citizen stats
    const issueCount = user?.role === 'authority' ? (authorityStats?.total || 0) : (stats?.totalReports || 0);
    const pendingCount = user?.role === 'authority' ? (authorityStats?.pending || 0) : (stats?.pending || 0);
    const resolvedCount = user?.role === 'authority' ? (authorityStats?.resolved || 0) : (stats?.resolved || 0);
    const inProgressCount = user?.role === 'authority' ? (authorityStats?.inProgress || 0) : (stats?.inProgress || 0);

    try {
      const response = await getGeminiResponse(content, {
        role: user?.role || 'citizen',
        issueCount,
        pendingCount,
        resolvedCount,
        inProgressCount,
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
  }, [user, stats, authorityStats]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { messages, isOpen, isTyping, sendMessage, toggle, close };
}
