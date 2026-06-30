import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { STATUS_TRANSITIONS, type IssueWorkflowStatus, type ResolutionData } from '@/types/workflow';
import { createNotification } from './notificationService';

/**
 * Validates and transitions an issue to a new status.
 */
export async function transitionStatus(
  issueId: string,
  currentStatus: IssueWorkflowStatus,
  newStatus: IssueWorkflowStatus,
  performedBy: string,
  note?: string
): Promise<void> {
  const allowed = STATUS_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from "${currentStatus}" to "${newStatus}".`);
  }

  const issueRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(issueRef);
  const currentTimeline = docSnap.data()?.timeline || [];

  const timelineEntry = {
    action: `Status changed to "${newStatus.replace('_', ' ')}"`,
    by: performedBy,
    at: new Date().toISOString(),
    note: note || '',
  };

  if (newStatus === 'in_progress') {
    await updateDoc(issueRef, {
      status: newStatus,
      inProgressAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: [...currentTimeline, timelineEntry],
    });
  } else {
    await updateDoc(issueRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      timeline: [...currentTimeline, timelineEntry],
    });
  }

  // Notify the reporter
  const reporterUid = docSnap.data()?.reporter?.uid;
  const issueTitle = docSnap.data()?.title || 'your issue';
  if (reporterUid) {
    await createNotification(
      reporterUid,
      'status_updated',
      'Issue Status Updated',
      `"${issueTitle}" has been moved to ${newStatus.replace('_', ' ')}.`,
      issueId
    );
  }
}

/**
 * Resolves an issue with a summary and optional evidence.
 */
export async function resolveIssue(
  issueId: string,
  resolution: ResolutionData,
  resolvedBy: string
): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(issueRef);
  const currentTimeline = docSnap.data()?.timeline || [];

  const timelineEntry = {
    action: 'Issue Resolved',
    by: resolvedBy,
    at: new Date().toISOString(),
    note: resolution.summary,
  };

  await updateDoc(issueRef, {
    status: 'resolved',
    resolution: {
      summary: resolution.summary,
      completedAt: resolution.completedAt,
      imageDataURL: resolution.imageDataURL || null,
    },
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timeline: [...currentTimeline, timelineEntry],
  });

  // Notify the reporter
  const reporterUid = docSnap.data()?.reporter?.uid;
  const issueTitle = docSnap.data()?.title || 'your issue';
  if (reporterUid) {
    await createNotification(
      reporterUid,
      'resolution',
      'Issue Resolved! 🎉',
      `"${issueTitle}" has been resolved: ${resolution.summary}`,
      issueId
    );
  }
}

/**
 * Adds an internal note to an issue.
 */
export async function addInternalNote(
  issueId: string,
  note: string,
  addedBy: string
): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(issueRef);
  const currentTimeline = docSnap.data()?.timeline || [];

  const timelineEntry = {
    action: 'Internal Note',
    by: addedBy,
    at: new Date().toISOString(),
    note,
  };

  await updateDoc(issueRef, {
    updatedAt: serverTimestamp(),
    timeline: [...currentTimeline, timelineEntry],
  });
}
