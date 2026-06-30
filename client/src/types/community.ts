/**
 * Types for community collaboration features.
 */

// ─── Community Feed ───

export interface FeedIssue {
  documentId: string;
  trackingId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  department: string;
  address: string;
  imageDataURL: string;
  aiConfidence: number;
  verificationCount: number;
  commentCount: number;
  reporterName: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
}

// ─── Comments ───

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  parentId: string | null; // null = top-level, string = reply
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentInput {
  content: string;
  parentId?: string | null;
}

// ─── Verification ───

export interface Verification {
  userId: string;
  userName: string;
  verifiedAt: string;
}

// ─── Following ───

export interface FollowData {
  followers: string[]; // user IDs
  followerCount: number;
}

// ─── Notifications ───

export type NotificationType =
  | 'issue_assigned'
  | 'status_updated'
  | 'authority_comment'
  | 'resolution'
  | 'community_verification'
  | 'new_comment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  issueId?: string;
  read: boolean;
  createdAt: Date;
}

// ─── Nearby ───

export interface NearbyFilter {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

// ─── Feed Filters ───

export interface CommunityFilters {
  search: string;
  category: string | null;
  status: string | null;
  severity: string | null;
  department: string | null;
  sortBy: 'newest' | 'most_verified' | 'nearest';
}
