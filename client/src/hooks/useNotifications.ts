import { useState, useEffect, useCallback } from 'react';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/services/notificationService';
import { useAuth } from '@/features/auth';
import type { AppNotification } from '@/types/community';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchNotifications(user.uid);
      setNotifications(data);
    } catch { /* silent */ }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await markAllAsRead(user.uid);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user]);

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh: fetch };
}
