/**
 * Types for achievements with progress tracking.
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  completed: boolean;
  category: 'reporting' | 'resolution' | 'community';
}

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'current' | 'completed'>[] = [
  { id: 'reports_10', name: 'Report 10 Issues', description: 'Submit 10 community issue reports', icon: '📋', target: 10, category: 'reporting' },
  { id: 'reports_25', name: 'Report 25 Issues', description: 'Submit 25 community issue reports', icon: '📝', target: 25, category: 'reporting' },
  { id: 'resolved_5', name: 'Get 5 Resolved', description: 'Have 5 of your issues resolved', icon: '✅', target: 5, category: 'resolution' },
  { id: 'resolved_10', name: 'Get 10 Resolved', description: 'Have 10 of your issues resolved', icon: '🎉', target: 10, category: 'resolution' },
  { id: 'categories_5', name: 'Report in 5 Categories', description: 'Submit issues across 5 different categories', icon: '🌈', target: 5, category: 'community' },
  { id: 'impact_80', name: 'Reach 80% Impact', description: 'Achieve 80% community impact score', icon: '🚀', target: 80, category: 'community' },
];
