/**
 * Types for AI-powered dashboard insights.
 */

export interface DashboardInsights {
  welcomeMessage: string;
  suggestedAction: SuggestedAction;
  dailySummary: DailySummary;
  insightCards: InsightCard[];
}

export interface SuggestedAction {
  label: string;
  description: string;
  route: string;
  icon: string; // Lucide icon name
}

export interface DailySummary {
  topCategory: string;
  resolvedCount: number;
  communityTrend: 'improving' | 'stable' | 'declining';
  confidence: number;
}

export interface InsightCard {
  id: string;
  type: 'trend' | 'impact' | 'recommendation' | 'activity';
  title: string;
  description: string;
  metric?: string;
  icon: string;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'danger';
}
