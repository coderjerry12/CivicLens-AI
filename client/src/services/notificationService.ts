import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AppNotification, NotificationType } from '@/types/community';

/**
 * Fetches notifications for a user.
 */
export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  const notifsRef = collection(db, 'notifications');
  const q = query(notifsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      type: d.data().type as NotificationType,
      title: d.data().title || '',
      message: d.data().message || '',
      issueId: d.data().issueId || undefined,
      read: d.data().read || false,
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    }));
  } catch {
    // Fallback if index doesn't exist — fetch without ordering
    const fallbackQ = query(notifsRef, where('userId', '==', userId));
    const snapshot = await getDocs(fallbackQ);
    const notifs = snapshot.docs.map((d) => ({
      id: d.id,
      type: d.data().type as NotificationType,
      title: d.data().title || '',
      message: d.data().message || '',
      issueId: d.data().issueId || undefined,
      read: d.data().read || false,
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    }));
    return notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

/**
 * Creates a notification for a user.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  issueId?: string
): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    userId,
    type,
    title,
    message,
    issueId: issueId || null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/**
 * Mark a single notification as read.
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
}
