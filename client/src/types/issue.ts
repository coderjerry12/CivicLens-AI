/**
 * Types for issue reports and Firestore documents.
 */

export interface IssueReport {
  trackingId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  department: string;
  status: 'pending' | 'validated' | 'in_progress' | 'resolved' | 'closed';
  imageDataURL: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    source: string;
  };
  aiMetadata: {
    confidence: number;
    wasEdited: boolean;
    model: string;
    analyzedAt: string;
  };
  reporter: {
    uid: string;
    name: string;
    email: string;
  };
  timeline: TimelineEntry[];
  validations: number;
  createdAt: unknown; // Firestore serverTimestamp
  updatedAt: unknown;
}

export interface TimelineEntry {
  action: string;
  by: string;
  at: string;
  note?: string;
}

export interface SubmissionData {
  title: string;
  description: string;
  category: string;
  severity: string;
  department: string;
  imageDataURL: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    source: string;
  };
  aiConfidence: number;
  wasEdited: boolean;
}
