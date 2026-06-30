/**
 * Core type definitions for CivicLens AI.
 */

// ─── User Types ───

export type UserRole = 'citizen' | 'authority' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Issue Types ───

export type IssueStatus =
  | 'reported'
  | 'validated'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export type IssueCategory =
  | 'pothole'
  | 'water_leakage'
  | 'garbage'
  | 'streetlight'
  | 'road_hazard'
  | 'drainage'
  | 'noise'
  | 'other';

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  location: GeoLocation;
  images: string[];
  reportedBy: string;
  assignedTo?: string;
  validations: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  aiSummary?: string;
}

// ─── Notification Types ───

export type NotificationType =
  | 'status_update'
  | 'new_issue'
  | 'validation'
  | 'assignment'
  | 'resolution';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  issueId?: string;
  createdAt: string;
}

// ─── API Response Types ───

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Component Props ───

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}
