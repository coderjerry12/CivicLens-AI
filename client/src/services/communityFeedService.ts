import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { createNotification } from './notificationService';
import type { FeedIssue } from '@/types/community';

/**
 * Fetches all issues for the community feed.
 */
export async function fetchCommunityFeed(): Promise<FeedIssue[]> {
  const snapshot = await getDocs(collection(db, 'issues'));
  const issues: FeedIssue[] = [];

  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    issues.push({
      documentId: docSnap.id,
      trackingId: d.trackingId || '',
      title: d.title || 'Untitled',
      category: d.category || 'other',
      severity: d.severity || 'medium',
      status: d.status || 'pending',
      department: d.department || 'general',
      address: d.location?.address || '',
      imageDataURL: d.imageDataURL || '',
      aiConfidence: d.aiMetadata?.confidence || 0,
      verificationCount: d.verifications?.length || d.validations || 0,
      commentCount: d.commentCount || 0,
      reporterName: d.reporter?.name || 'Anonymous',
      latitude: d.location?.latitude || 0,
      longitude: d.location?.longitude || 0,
      createdAt: d.createdAt?.toDate?.() || new Date(),
    });
  });

  return issues.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Verify an issue — adds userId to verifications array.
 */
export async function verifyIssue(issueId: string, userId: string, userName: string): Promise<boolean> {
  const issueRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(issueRef);
  const data = docSnap.data();

  const verifications: { userId: string; userName: string; verifiedAt: string }[] = data?.verifications || [];

  // Prevent duplicate
  if (verifications.some((v) => v.userId === userId)) return false;

  verifications.push({ userId, userName, verifiedAt: new Date().toISOString() });

  await updateDoc(issueRef, {
    verifications,
    validations: verifications.length,
  });

  // Notify the reporter
  const reporterUid = data?.reporter?.uid;
  const issueTitle = data?.title || 'an issue';
  if (reporterUid && reporterUid !== userId) {
    await createNotification(
      reporterUid,
      'community_verification',
      'Issue Verified',
      `${userName} verified "${issueTitle}". ${verifications.length} total verifications.`,
      issueId
    );
  }

  return true;
}

/**
 * Follow/unfollow an issue.
 */
export async function toggleFollow(issueId: string, userId: string): Promise<boolean> {
  const issueRef = doc(db, 'issues', issueId);
  const docSnap = await getDoc(issueRef);
  const followers: string[] = docSnap.data()?.followers || [];

  const isFollowing = followers.includes(userId);
  const updated = isFollowing
    ? followers.filter((id) => id !== userId)
    : [...followers, userId];

  await updateDoc(issueRef, { followers: updated });
  return !isFollowing; // returns new follow state
}

/**
 * Check if user follows an issue.
 */
export function isFollowing(followers: string[], userId: string): boolean {
  return followers.includes(userId);
}
