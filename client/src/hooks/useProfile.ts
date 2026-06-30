import { useMemo } from 'react';
import { calculateReputation } from '@/services/reputationService';
import { evaluateBadges } from '@/services/badgeService';
import { evaluateAchievements } from '@/services/achievementService';
import type { ReportCardData } from '@/types/reportCard';

/**
 * Hook that computes the full gamification profile from user reports.
 */
export function useProfile(reports: ReportCardData[]) {
  const reputation = useMemo(() => calculateReputation(reports), [reports]);
  const badges = useMemo(() => evaluateBadges(reports), [reports]);
  const achievements = useMemo(() => evaluateAchievements(reports), [reports]);

  // Activity heatmap: count reports per day for last 90 days
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    const now = Date.now();
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;

    reports.forEach((r) => {
      if (now - r.createdAt.getTime() <= ninetyDays) {
        const key = r.createdAt.toISOString().split('T')[0];
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [reports]);

  return { reputation, badges, achievements, activityMap };
}
