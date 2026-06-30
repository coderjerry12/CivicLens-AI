import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createNotification } from './notificationService';
import type { AssignmentData } from '@/types/workflow';

/**
 * Assigns an issue to a department and optionally an officer.
 * Updates status to 'assigned' and appends to timeline.
 */
export async function assignIssue(
  issueId: string,
  assignment: AssignmentData,
  assignedBy: string
): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);

  const timelineEntry = {
    action: `Assigned to ${assignment.department.replace('_', ' ')}${assignment.officer ? ` (${assignment.officer})` : ''}`,
    by: assignedBy,
    at: new Date().toISOString(),
    note: assignment.note || '',
  };

  // Get current doc to check if timeline exists
  const docSnap = await getDoc(issueRef);
  const currentTimeline = docSnap.data()?.timeline || [];

  await updateDoc(issueRef, {
    status: 'assigned',
    department: assignment.department,
    assignedOfficer: assignment.officer || null,
    assignedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    timeline: [...currentTimeline, timelineEntry],
  });

  // Notify the reporter
  const reporterUid = docSnap.data()?.reporter?.uid;
  const issueTitle = docSnap.data()?.title || 'your issue';
  if (reporterUid) {
    await createNotification(
      reporterUid,
      'issue_assigned',
      'Issue Assigned',
      `"${issueTitle}" has been assigned to ${assignment.department.replace('_', ' ')}.`,
      issueId
    );
  }
}
