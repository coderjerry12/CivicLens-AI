/**
 * Types for bulk operations on issues.
 */

export type BulkActionType = 'status' | 'assign' | 'priority';

export interface BulkActionResult {
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export interface BulkState {
  executing: boolean;
  progress: number; // 0-100
  result: BulkActionResult | null;
  error: string | null;
}
