import { useState, useEffect } from 'react';
import { subscribeToUserNotifications } from '@/services/realtimeService';
import { useAuth } from '@/features/auth';
import type { AppNotification } from '@/types/community';

/**
 * Hook for realtime notification updates via Firestore listener.
 */
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const unsubscribe = subscribeToUserNotifications(user.uid, (raw) => {
      const notifs: AppNotification[] = (raw as Array<Record<string, unknown>>).map((n) => ({
        id: n.id as string,
        type: (n.type as AppNotification['type']) || 'status_updated',
        title: (n.title as string) || '',
        message: (n.message as string) || '',
        issueId: n.issueId as string | undefined,
        read: (n.read as boolean) || false,
        createdAt: (n.createdAt as { toDate?: () => Date })?.toDate?.() || new Date(),
      }));
      setNotifications(notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  return { notifications, unreadCount, loading };
}
