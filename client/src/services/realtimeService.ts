import { collection, onSnapshot, query, where, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Realtime Firestore listeners.
 * Returns unsubscribe functions for cleanup.
 */

export function subscribeToIssues(callback: (issues: unknown[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'issues'), (snapshot) => {
    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(issues);
  });
}

export function subscribeToUserNotifications(userId: string, callback: (notifs: unknown[]) => void): Unsubscribe {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(notifs);
  });
}

export function subscribeToIssueComments(issueId: string, callback: (comments: unknown[]) => void): Unsubscribe {
  const commentsRef = collection(db, 'issues', issueId, 'comments');
  return onSnapshot(commentsRef, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(comments);
  });
}

export function subscribeToSingleIssue(issueId: string, callback: (data: unknown) => void): Unsubscribe {
  const { doc: docRef } = require('firebase/firestore');
  return onSnapshot(docRef(db, 'issues', issueId), (snapshot: { data: () => unknown; id: string }) => {
    callback({ id: snapshot.id, ...snapshot.data() as object });
  });
}
