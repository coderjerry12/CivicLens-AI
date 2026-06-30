/**
 * Types for report card display on dashboard.
 */

export interface ReportCardData {
  documentId: string;
  trackingId: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  address: string;
  imageDataURL: string;
  createdAt: Date;
}
