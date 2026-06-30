/**
 * Types for the issue workspace (authority detail view).
 */

export interface IssueWorkspaceData {
  issue: WorkspaceIssue;
  similarIssues: SimilarIssue[];
}

export interface WorkspaceIssue {
  documentId: string;
  trackingId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  department: string;
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
  timeline: { action: string; by: string; at: string; note?: string }[];
  validations: number;
  priorityScore: number;
  riskLevel: RiskLevel;
  createdAt: Date;
  updatedAt: Date;
}

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface SimilarIssue {
  documentId: string;
  trackingId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  distance: number; // km
  similarityScore: number; // 0-100
  createdAt: Date;
}
