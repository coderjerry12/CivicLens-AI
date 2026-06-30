import type { Achievement } from '@/types/achievement';
import { ACHIEVEMENT_DEFINITIONS } from '@/types/achievement';
import type { ReportCardData } from '@/types/reportCard';

/**
 * Calculates achievement progress from user reports.
 */
export function evaluateAchievements(reports: ReportCardData[]): Achievement[] {
  const total = reports.length;
  const resolved = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  const categories = new Set(reports.map((r) => r.category)).size;
  const impactScore = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const progressMap: Record<string, number> = {
    reports_10: total,
    reports_25: total,
    resolved_5: resolved,
    resolved_10: resolved,
    categories_5: categories,
    impact_80: impactScore,
  };

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const current = Math.min(progressMap[def.id] || 0, def.target);
    return {
      ...def,
      current,
      completed: current >= def.target,
    };
  });
}
