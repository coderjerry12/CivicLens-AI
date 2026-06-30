/**
 * Generates human-readable tracking IDs for issues.
 * Format: CL-YYYYMMDD-XXXX (e.g., CL-20250630-7A3F)
 */

export function generateTrackingId(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `CL-${date}-${random}`;
}
