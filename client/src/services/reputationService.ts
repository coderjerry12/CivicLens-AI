import type { ReportCardData } from '@/types/reportCard';
import type { ReputationProfile, CivicLevel } from '@/types/reputation';
import { LEVEL_THRESHOLDS } from '@/types/reputation';

/**
 * Calculates a user's reputation profile from their reports.
 */
export function calculateReputation(reports: ReportCardData[]): ReputationProfile {
  const reportsSubmitted = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved' || r.status === 'closed').length;
  const communityValidations = 0; // Placeholder — will come from validation system
  const streakDays = calculateStreak(reports);

  // Score calculation
  const score =
    reportsSubmitted * 15 +  // 15 pts per report
    resolvedReports * 25 +   // 25 pts per resolved
    communityValidations * 10 + // 10 pts per validation
    streakDays * 5;          // 5 pts per streak day

  const level = getLevel(score);
  const nextLevel = getNextLevel(level);
  const currentThreshold = LEVEL_THRESHOLDS.find((t) => t.level === level)!.minScore;
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS.find((t) => t.level === nextLevel)!.minScore : score;
  const progressToNext = nextLevel
    ? Math.min(Math.round(((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100), 100)
    : 100;
  const pointsToNext = nextLevel ? nextThreshold - score : 0;

  return {
    score,
    level,
    nextLevel,
    progressToNext,
    pointsToNext,
    breakdown: { reportsSubmitted, resolvedReports, communityValidations, streakDays },
  };
}

function getLevel(score: number): CivicLevel {
  let currentLevel: CivicLevel = 'Seed';
  for (const threshold of LEVEL_THRESHOLDS) {
    if (score >= threshold.minScore) currentLevel = threshold.level;
  }
  return currentLevel;
}

function getNextLevel(current: CivicLevel): CivicLevel | null {
  const idx = LEVEL_THRESHOLDS.findIndex((t) => t.level === current);
  if (idx < LEVEL_THRESHOLDS.length - 1) return LEVEL_THRESHOLDS[idx + 1].level;
  return null;
}

function calculateStreak(reports: ReportCardData[]): number {
  if (reports.length === 0) return 0;
  const dates = reports
    .map((r) => r.createdAt.toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const diff = new Date(dates[i]).getTime() - new Date(dates[i + 1]).getTime();
    if (diff <= 86400000 * 1.5) streak++;
    else break;
  }
  return streak;
}
