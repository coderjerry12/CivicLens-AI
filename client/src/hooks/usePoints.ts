import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { useRecentReports, useProfile } from '@/hooks';
import { loadUserPoints, type UserPointsData } from '@/services/pointsService';

/**
 * Central hook for user points across the platform.
 * Combines report-based points + bonus points - spent points.
 * All gamification pages should use this hook for consistent point display.
 */
export function usePoints() {
  const { user } = useAuth();
  const { reports, loading: reportsLoading } = useRecentReports(100);
  const { reputation } = useProfile(reports);

  const [pointsData, setPointsData] = useState<UserPointsData>({
    bonusPoints: 0,
    spentPoints: 0,
    redeemedIds: [],
    quizHistory: [],
    challengesClaimed: [],
    lastUpdated: '',
  });
  const [loading, setLoading] = useState(true);

  // Total available points = report-based score + bonus - spent
  const totalEarned = reputation.score + pointsData.bonusPoints;
  const availablePoints = totalEarned - pointsData.spentPoints;

  // Load from Firestore
  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      const data = await loadUserPoints(user.uid);
      setPointsData(data);
      setLoading(false);
    }
    load();
  }, [user]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (!user) return;
    const data = await loadUserPoints(user.uid);
    setPointsData(data);
  }, [user]);

  // Update local state (for optimistic updates)
  const updateLocal = useCallback((data: UserPointsData) => {
    setPointsData(data);
  }, []);

  return {
    // Computed values
    totalEarned,
    availablePoints,
    baseScore: reputation.score,
    bonusPoints: pointsData.bonusPoints,
    spentPoints: pointsData.spentPoints,
    level: reputation.level,
    nextLevel: reputation.nextLevel,
    progressToNext: reputation.progressToNext,
    pointsToNext: reputation.pointsToNext,
    breakdown: reputation.breakdown,

    // Firestore data
    redeemedIds: pointsData.redeemedIds,
    quizHistory: pointsData.quizHistory,
    challengesClaimed: pointsData.challengesClaimed,

    // State
    loading: loading || reportsLoading,
    reports,

    // Actions
    refresh,
    updateLocal,
  };
}
