import { useState, useCallback } from 'react';
import { getGeminiResponse } from '@/services/geminiAssistantService';
import { useAuth } from '@/features/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AssistantMessage } from '@/services/aiAssistantService';

/**
 * Hook for the floating AI assistant — now powered by Gemini.
 * Fetches live stats before every message for data consistency.
 */
export function useAIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: '0', role: 'assistant', content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! I'm your CivicLens AI assistant. How can I help you today?`, timestamp: new Date() },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch fresh stats right before responding (ensures consistency)
  const fetchLiveStats = useCallback(async () => {
    if (!user) return { total: 0, pending: 0, resolved: 0, inProgress: 0 };

    try {
      if (user.role === 'authority') {
        // Authority sees all issues
        const snap = await getDocs(collection(db, 'issues'));
        let total = 0, pending = 0, resolved = 0, inProgress = 0;
        snap.forEach((d) => {
          const s = d.data().status;
          total++;
          if (s === 'pending' || s === 'validated') pending++;
          else if (s === 'in_progress') inProgress++;
          else if (s === 'resolved' || s === 'closed') resolved++;
        });
        return { total, pending, resolved, inProgress };
      } else {
        // Citizen sees own issues
        const q = query(collection(db, 'issues'), where('reporter.uid', '==', user.uid));
        const snap = await getDocs(q);
        let total = 0, pending = 0, resolved = 0, inProgress = 0;
        snap.forEach((d) => {
          const s = d.data().status;
          total++;
          if (s === 'pending' || s === 'validated') pending++;
          else if (s === 'in_progress') inProgress++;
          else if (s === 'resolved' || s === 'closed') resolved++;
        });
        return { total, pending, resolved, inProgress };
      }
    } catch {
      return { total: 0, pending: 0, resolved: 0, inProgress: 0 };
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: AssistantMessage = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Fetch fresh stats right now
    const liveStats = await fetchLiveStats();

    try {
      const response = await getGeminiResponse(content, {
        role: user?.role || 'citizen',
        issueCount: liveStats.total,
        pendingCount: liveStats.pending,
        resolvedCount: liveStats.resolved,
        inProgressCount: liveStats.inProgress,
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
  }, [user, fetchLiveStats]);

  const resetMessages = useCallback(() => {
    setMessages([
      { id: Date.now().toString(), role: 'assistant', content: `Hi ${user?.displayName?.split(' ')[0] || 'there'}! I'm your CivicLens AI assistant. How can I help you today?`, timestamp: new Date() },
    ]);
  }, [user]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) resetMessages();
      return !prev;
    });
  }, [resetMessages]);

  const close = useCallback(() => {
    setIsOpen(false);
    resetMessages();
  }, [resetMessages]);

  return { messages, isOpen, isTyping, sendMessage, toggle, close };
}
