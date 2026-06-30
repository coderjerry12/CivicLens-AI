import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface TimelineEntry {
  action: string;
  by: string;
  at: string;
  note?: string;
}

/**
 * Appends a new entry to an issue's timeline array in Firestore.
 * Never overwrites previous entries.
 */
export async function appendTimeline(issueId: string, entry: TimelineEntry): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    timeline: arrayUnion(entry),
  });
}
