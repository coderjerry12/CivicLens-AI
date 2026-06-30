import type { PriorityLabel } from '@/types/issueQueue';

interface PriorityInput {
  severity: string;
  createdAt: Date;
  aiConfidence: number;
  validations: number;
  status: string;
}

const SEVERITY_SCORE: Record<string, number> = {
  critical: 40,
  high: 30,
  medium: 15,
  low: 5,
};

/**
 * Calculates a priority score (0-100) for an issue.
 * Higher = more urgent.
 *
 * Factors:
 * - Severity (40% weight)
 * - Age in days (25% weight) — older unresolved = higher priority
 * - AI confidence (20% weight) — higher confidence = more reliable
 * - Community validations (15% weight)
 */
export function calculatePriorityScore(input: PriorityInput): number {
  // Skip resolved issues
  if (input.status === 'resolved' || input.status === 'closed') return 0;

  // Severity component (0-40)
  const severityScore = SEVERITY_SCORE[input.severity] || 10;

  // Age component (0-25) — older = higher, caps at 30 days
  const ageMs = Date.now() - input.createdAt.getTime();
  const ageDays = Math.min(ageMs / (1000 * 60 * 60 * 24), 30);
  const ageScore = Math.round((ageDays / 30) * 25);

  // AI confidence component (0-20) — higher confidence = more priority
  const confidenceScore = Math.round((input.aiConfidence / 100) * 20);

  // Validation component (0-15) — more community validations = higher priority
  const validationScore = Math.min(input.validations * 5, 15);

  return Math.min(severityScore + ageScore + confidenceScore + validationScore, 100);
}

/**
 * Maps a priority score to a human-readable label.
 */
export function getPriorityLabel(score: number): PriorityLabel {
  if (score >= 70) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  return 'Low';
}
