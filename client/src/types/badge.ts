/**
 * Types for the badge system.
 */

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'reporting' | 'community' | 'streak' | 'special';
}

export const ALL_BADGES: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
  // Reporting
  { id: 'first_report', name: 'First Report', description: 'Submit your first issue report', icon: '📝', category: 'reporting' },
  { id: 'reporter_5', name: 'Active Reporter', description: 'Submit 5 reports', icon: '📋', category: 'reporting' },
  { id: 'reporter_10', name: 'Dedicated Reporter', description: 'Submit 10 reports', icon: '🏅', category: 'reporting' },
  { id: 'reporter_25', name: 'Issue Hunter', description: 'Submit 25 reports', icon: '🎯', category: 'reporting' },
  { id: 'multi_category', name: 'Versatile', description: 'Report issues in 3+ categories', icon: '🌈', category: 'reporting' },

  // Community
  { id: 'first_resolved', name: 'Problem Solver', description: 'Get your first issue resolved', icon: '✅', category: 'community' },
  { id: 'resolved_5', name: 'Impact Maker', description: 'Get 5 issues resolved', icon: '💪', category: 'community' },
  { id: 'high_impact', name: 'High Impact', description: 'Reach 80% community impact score', icon: '🚀', category: 'community' },

  // Streak
  { id: 'streak_3', name: '3-Day Streak', description: 'Report issues 3 days in a row', icon: '🔥', category: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Report issues 7 days in a row', icon: '⚡', category: 'streak' },

  // Special
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join CivicLens AI in its first month', icon: '🌟', category: 'special' },
  { id: 'ai_collaborator', name: 'AI Collaborator', description: 'Edit AI suggestions on 5 reports', icon: '🤖', category: 'special' },
];
