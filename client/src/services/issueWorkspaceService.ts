import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { calculatePriorityScore } from '@/utils/priorityEngine';
import { findSimilarIssues } from './similarityService';
import type { IssueWorkspaceData, WorkspaceIssue, RiskLevel } from '@/types/issueWorkspace';

/**
 * Fetches a single issue with full workspace data + similar issues.
 */
export async function fetchIssueWorkspace(issueId: string): Promise<IssueWorkspaceData | null> {
  // Fetch the main issue
  const docRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const d = docSnap.data();
  const createdAt = d.createdAt?.toDate?.() || new Date();
  const updatedAt = d.updatedAt?.toDate?.() || createdAt;

  const priorityScore = calculatePriorityScore({
    severity: d.severity || 'medium',
    createdAt,
    aiConfidence: d.aiMetadata?.confidence || 50,
    validations: d.validations || 0,
    status: d.status || 'pending',
  });

  const issue: WorkspaceIssue = {
    documentId: docSnap.id,
    trackingId: d.trackingId || '',
    title: d.title || 'Untitled',
    description: d.description || '',
    category: d.category || 'other',
    severity: d.severity || 'medium',
    status: d.status || 'pending',
    department: d.department || 'general',
    imageDataURL: d.imageDataURL || '',
    location: {
      latitude: d.location?.latitude || 0,
      longitude: d.location?.longitude || 0,
      address: d.location?.address || '',
      source: d.location?.source || 'manual',
    },
    aiMetadata: {
      confidence: d.aiMetadata?.confidence || 0,
      wasEdited: d.aiMetadata?.wasEdited || false,
      model: d.aiMetadata?.model || 'unknown',
      analyzedAt: d.aiMetadata?.analyzedAt || '',
    },
    reporter: {
      uid: d.reporter?.uid || '',
      name: d.reporter?.name || 'Anonymous',
      email: d.reporter?.email || '',
    },
    timeline: d.timeline || [],
    validations: d.validations || 0,
    priorityScore,
    riskLevel: getRiskLevel(d.severity, priorityScore),
    createdAt,
    updatedAt,
  };

  // Fetch all issues for similarity comparison
  const allSnapshot = await getDocs(collection(db, 'issues'));
  const allIssues = allSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      documentId: doc.id,
      trackingId: data.trackingId || '',
      title: data.title || '',
      category: data.category || 'other',
      severity: data.severity || 'medium',
      status: data.status || 'pending',
      latitude: data.location?.latitude || 0,
      longitude: data.location?.longitude || 0,
      aiConfidence: data.aiMetadata?.confidence || 50,
      createdAt: data.createdAt?.toDate?.() || new Date(),
    };
  });

  const similarIssues = findSimilarIssues(
    issue.documentId,
    issue.category,
    issue.location.latitude,
    issue.location.longitude,
    allIssues
  );

  return { issue, similarIssues };
}

function getRiskLevel(severity: string, priorityScore: number): RiskLevel {
  if (severity === 'critical' || priorityScore >= 75) return 'critical';
  if (severity === 'high' || priorityScore >= 55) return 'high';
  if (priorityScore >= 30) return 'moderate';
  return 'low';
}
