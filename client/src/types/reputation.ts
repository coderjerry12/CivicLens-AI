/**
 * Types for reputation and leveling system.
 */

export interface ReputationProfile {
  score: number; // 0-1000+
  level: CivicLevel;
  nextLevel: CivicLevel | null;
  progressToNext: number; // 0-100
  pointsToNext: number;
  breakdown: ReputationBreakdown;
}

export interface ReputationBreakdown {
  reportsSubmitted: number;
  resolvedReports: number;
  communityValidations: number;
  streakDays: number;
}

export type CivicLevel = 'Seed' | 'Volunteer' | 'Guardian' | 'Community Hero' | 'City Champion' | 'Legend';

export const LEVEL_THRESHOLDS: { level: CivicLevel; minScore: number; icon: string; color: string }[] = [
  { level: 'Seed', minScore: 0, icon: '🌱', color: 'text-neutral-500' },
  { level: 'Volunteer', minScore: 50, icon: '🤝', color: 'text-primary-500' },
  { level: 'Guardian', minScore: 150, icon: '🛡️', color: 'text-secondary-500' },
  { level: 'Community Hero', minScore: 350, icon: '⭐', color: 'text-accent-500' },
  { level: 'City Champion', minScore: 600, icon: '🏆', color: 'text-success-500' },
  { level: 'Legend', minScore: 1000, icon: '👑', color: 'text-danger-500' },
];
