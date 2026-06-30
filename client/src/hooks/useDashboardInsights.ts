import { useMemo } from 'react';
import { generateInsights } from '@/services/insightsService';
import type { ReportCardData } from '@/types/reportCard';
import type { DashboardStats } from '@/types/dashboard';
import type { DashboardInsights } from '@/types/insight';

/**
 * Hook that generates dashboard insights from existing data.
 * Re-computes when reports or stats change.
 * Designed for easy future replacement with Gemini API.
 */
export function useDashboardInsights(
  reports: ReportCardData[],
  stats: DashboardStats | null,
  userName: string
): DashboardInsights {
  return useMemo(
    () => generateInsights(reports, stats, userName),
    [reports, stats, userName]
  );
}
