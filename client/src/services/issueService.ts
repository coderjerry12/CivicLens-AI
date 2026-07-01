import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateTrackingId } from '@/utils/issueIdGenerator';
import type { SubmissionData, IssueReport } from '@/types/issue';

export interface SubmitIssueOptions {
  data: SubmissionData;
  userId: string;
  userName: string;
  userEmail: string;
}

export interface SubmitResult {
  success: boolean;
  trackingId: string;
  documentId: string;
  error?: string;
}

/**
 * Submits a complete issue report to Firestore.
 */
export async function submitIssueReport(options: SubmitIssueOptions): Promise<SubmitResult> {
  const { data, userId, userName, userEmail } = options;
  const trackingId = generateTrackingId();
  const documentId = `${userId}_${Date.now()}`;

  const report: IssueReport = {
    trackingId,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    severity: data.severity,
    department: data.department,
    status: 'pending',
    imageDataURL: data.imageDataURL,
    ...(data.videoDataURL && { videoDataURL: data.videoDataURL }),
    location: {
      latitude: data.location.latitude,
      longitude: data.location.longitude,
      address: data.location.address,
      source: data.location.source,
    },
    aiMetadata: {
      confidence: data.aiConfidence,
      wasEdited: data.wasEdited,
      model: 'gemini-2.5-flash',
      analyzedAt: new Date().toISOString(),
    },
    reporter: {
      uid: userId,
      name: userName,
      email: userEmail,
    },
    timeline: [
      {
        action: 'Issue reported',
        by: userName,
        at: new Date().toISOString(),
        note: 'Issue submitted via CivicLens AI',
      },
    ],
    validations: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'issues', documentId), report);
    return { success: true, trackingId, documentId };
  } catch (error) {
    console.error('[IssueService] Submit failed:', error);
    return {
      success: false,
      trackingId: '',
      documentId: '',
      error: 'Failed to submit report. Please check your connection and try again.',
    };
  }
}
