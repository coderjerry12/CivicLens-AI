import type { Badge } from '@/types/badge';
import { ALL_BADGES } from '@/types/badge';
import type { ReportCardData } from '@/types/reportCard';

/**
 * Evaluates which badges a user has unlocked based on their reports.
 */
export function evaluateBadges(reports: ReportCardData[]): Badge[] {
  const total = reports.length;
  const resolved = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  const categories = new Set(reports.map((r) => r.category)).size;

  const unlockMap: Record<string, boolean> = {
    first_report: total >= 1,
    reporter_5: total >= 5,
    reporter_10: total >= 10,
    reporter_25: total >= 25,
    multi_category: categories >= 3,
    first_resolved: resolved >= 1,
    resolved_5: resolved >= 5,
    high_impact: total >= 5 && resolved / total >= 0.8,
    streak_3: false, // Would need proper streak calculation with dates
    streak_7: false,
    early_adopter: true, // Everyone in early phase gets this
    ai_collaborator: total >= 5, // Simplified: assume AI was used
  };

  return ALL_BADGES.map((badge) => ({
    ...badge,
    unlocked: unlockMap[badge.id] || false,
    unlockedAt: unlockMap[badge.id] ? new Date().toISOString() : undefined,
  }));
}
