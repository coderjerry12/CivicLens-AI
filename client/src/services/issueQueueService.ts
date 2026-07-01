import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculatePriorityScore, getPriorityLabel } from '@/utils/priorityEngine';
import type { QueueIssue } from '@/types/issueQueue';

/**
 * Fetches all issues and enriches them with priority scores.
 */
export async function fetchIssueQueue(): Promise<QueueIssue[]> {
  const snapshot = await getDocs(collection(db, 'issues'));
  const issues: QueueIssue[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    const createdAt = d.createdAt?.toDate?.() || new Date();
    const updatedAt = d.updatedAt?.toDate?.() || createdAt;
    const aiConfidence = d.aiMetadata?.confidence || 50;
    const validations = d.validations || 0;

    const priorityScore = calculatePriorityScore({
      severity: d.severity || 'medium',
      createdAt,
      aiConfidence,
      validations,
      status: d.status || 'pending',
    });

    issues.push({
      documentId: doc.id,
      trackingId: d.trackingId || '',
      title: d.title || 'Untitled',
      description: d.description || '',
      category: d.category || 'other',
      severity: d.severity || 'medium',
      status: d.status || 'pending',
      department: d.department || 'general',
      address: d.location?.address || '',
      reporterName: d.reporter?.name || 'Anonymous',
      reporterEmail: d.reporter?.email || '',
      reporterUid: d.reporter?.uid || '',
      imageDataURL: d.imageDataURL || '',
      aiConfidence,
      validations,
      priorityScore,
      priorityLabel: getPriorityLabel(priorityScore),
      createdAt,
      updatedAt,
    });
  });

  // Default sort by priority
  return issues.sort((a, b) => b.priorityScore - a.priorityScore);
}
