import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BulkActionResult } from '@/types/bulkAction';

/**
 * Bulk update status for multiple issues.
 */
export async function bulkUpdateStatus(
  issueIds: string[],
  newStatus: string,
  performedBy: string,
  onProgress?: (progress: number) => void
): Promise<BulkActionResult> {
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < issueIds.length; i++) {
    try {
      await updateIssueWithTimeline(issueIds[i], { status: newStatus }, `Bulk status update to "${newStatus}"`, performedBy);
      succeeded++;
    } catch {
      failed++;
      errors.push(`Failed to update ${issueIds[i]}`);
    }
    onProgress?.(Math.round(((i + 1) / issueIds.length) * 100));
  }

  return { total: issueIds.length, succeeded, failed, errors };
}

/**
 * Bulk assign department for multiple issues.
 */
export async function bulkAssignDepartment(
  issueIds: string[],
  department: string,
  performedBy: string,
  onProgress?: (progress: number) => void
): Promise<BulkActionResult> {
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < issueIds.length; i++) {
    try {
      await updateIssueWithTimeline(
        issueIds[i],
        { department, status: 'assigned', assignedAt: serverTimestamp() },
        `Bulk assigned to ${department.replace('_', ' ')}`,
        performedBy
      );
      succeeded++;
    } catch {
      failed++;
      errors.push(`Failed to assign ${issueIds[i]}`);
    }
    onProgress?.(Math.round(((i + 1) / issueIds.length) * 100));
  }

  return { total: issueIds.length, succeeded, failed, errors };
}

/**
 * Bulk update severity/priority for multiple issues.
 */
export async function bulkUpdateSeverity(
  issueIds: string[],
  severity: string,
  performedBy: string,
  onProgress?: (progress: number) => void
): Promise<BulkActionResult> {
  let succeeded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < issueIds.length; i++) {
    try {
      await updateIssueWithTimeline(issueIds[i], { severity }, `Bulk severity update to "${severity}"`, performedBy);
      succeeded++;
    } catch {
      failed++;
      errors.push(`Failed to update ${issueIds[i]}`);
    }
    onProgress?.(Math.round(((i + 1) / issueIds.length) * 100));
  }

  return { total: issueIds.length, succeeded, failed, errors };
}

// ─── Internal helper ───

async function updateIssueWithTimeline(
  issueId: string,
  fields: { [key: string]: unknown },
  action: string,
  by: string
): Promise<void> {
  const issueRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(issueRef);
  const currentTimeline = docSnap.data()?.timeline || [];

  const timelineEntry = {
    action,
    by,
    at: new Date().toISOString(),
    note: '',
  };

  const updateData = {
    ...fields,
    updatedAt: serverTimestamp(),
    timeline: [...currentTimeline, timelineEntry],
  };

  await updateDoc(issueRef, updateData);
}
