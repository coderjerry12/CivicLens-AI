/**
 * Types for the GIS Operations Map.
 */

export interface MapIssue {
  documentId: string;
  trackingId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  department: string;
  latitude: number;
  longitude: number;
  address: string;
  reporterName: string;
  createdAt: Date;
}

export interface MapFilters {
  category: string | null;
  severity: string | null;
  status: string | null;
}

export interface Hotspot {
  latitude: number;
  longitude: number;
  radius: number; // km
  issueCount: number;
  topCategory: string;
  severity: 'low' | 'medium' | 'high';
}
