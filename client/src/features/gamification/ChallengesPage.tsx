import { useState } from 'react';
import { Target, Zap, Calendar, Lock, CheckCircle, Gift, Flame } from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { usePoints } from '@/hooks';
import { claimChallenge } from '@/services/pointsService';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly';
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function ChallengesPage() {
  const { user } = useAuth();
  const { reports, availablePoints, breakdown, challengesClaimed, updateLocal } = usePoints();

  const reportsToday = reports.filter(
    (r) => r.createdAt.toDateString() === new Date().toDateString()
  ).length;

  const reportsThisWeek = reports.filter((r) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return r.createdAt >= weekAgo;
  }).length;

  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;

  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([
    {
      id: 'd1',
      title: 'Daily Reporter',
      description: 'Submit 1 issue report today',
      icon: '📋',
      type: 'daily',
      target: 1,
      current: Math.min(reportsToday, 1),
      reward: 10,
      claimed: false,
    },
    {
      id: 'd2',
      title: 'Photo Evidence',
      description: 'Submit a report with photo evidence',
      icon: '📸',
      type: 'daily',
      target: 1,
      current: reports.filter((r) => r.imageDataURL && r.createdAt.toDateString() === new Date().toDateString()).length > 0 ? 1 : 0,
      reward: 15,
      claimed: false,
    },
    {
      id: 'd3',
      title: 'Community Voice',
      description: 'Use voice reporting to submit an issue',
      icon: '🎤',
      type: 'daily',
      target: 1,
      current: 0,
      reward: 20,
      claimed: false,
    },
  ]);

  const [weeklyChallenges, setWeeklyChallenges] = useState<Challenge[]>([
    {
      id: 'w1',
      title: 'Active Citizen',
      description: 'Submit 5 reports this week',
      icon: '🏃',
      type: 'weekly',
      target: 5,
      current: Math.min(reportsThisWeek, 5),
      reward: 50,
      claimed: false,
    },
    {
      id: 'w2',
      title: 'Problem Solver',
      description: 'Get 3 issues resolved this week',
      icon: '🧩',
      type: 'weekly',
      target: 3,
      current: Math.min(resolvedCount, 3),
      reward: 75,
      claimed: false,
    },
    {
      id: 'w3',
      title: 'Explorer',
      description: 'Report issues in 3 different categories',
      icon: '🗺️',
      type: 'weekly',
      target: 3,
      current: Math.min(new Set(reports.filter((r) => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return r.createdAt >= weekAgo;
      }).map((r) => r.category)).size, 3),
      reward: 40,
      claimed: false,
    },
  ]);

  const achievements: Achievement[] = [
    { id: 'a1', name: 'First Steps', description: 'Submit your first report', icon: '🌟', unlocked: reports.length >= 1, rarity: 'common' },
    { id: 'a2', name: 'Consistent', description: 'Submit 5 reports', icon: '💪', unlocked: reports.length >= 5, rarity: 'common' },
    { id: 'a3', name: 'Dedicated', description: 'Submit 10 reports', icon: '🎯', unlocked: reports.length >= 10, rarity: 'rare' },
    { id: 'a4', name: 'Veteran', description: 'Submit 25 reports', icon: '⚡', unlocked: reports.length >= 25, rarity: 'rare' },
    { id: 'a5', name: 'Problem Solver', description: 'Get 5 issues resolved', icon: '🧩', unlocked: resolvedCount >= 5, rarity: 'rare' },
    { id: 'a6', name: 'Hero', description: 'Get 10 issues resolved', icon: '🦸', unlocked: resolvedCount >= 10, rarity: 'epic' },
    { id: 'a7', name: 'Legend', description: 'Reach 500 points', icon: '👑', unlocked: availablePoints >= 500, rarity: 'epic' },
    { id: 'a8', name: 'Champion', description: 'Reach City Champion level', icon: '🏆', unlocked: availablePoints >= 600, rarity: 'legendary' },
    { id: 'a9', name: 'Streak Master', description: '7-day activity streak', icon: '🔥', unlocked: breakdown.streakDays >= 7, rarity: 'rare' },
    { id: 'a10', name: 'Multi-Category', description: 'Report in 5+ categories', icon: '🌈', unlocked: new Set(reports.map((r) => r.category)).size >= 5, rarity: 'epic' },
    { id: 'a11', name: 'Photo Pro', description: 'Submit 10 reports with photos', icon: '📷', unlocked: reports.filter((r) => r.imageDataURL).length >= 10, rarity: 'rare' },
    { id: 'a12', name: 'Night Owl', description: 'Report an issue after midnight', icon: '🦉', unlocked: reports.some((r) => r.createdAt.getHours() < 5), rarity: 'legendary' },
  ];

  const handleClaim = async (id: string, type: 'daily' | 'weekly') => {
    if (!user) return;
    // Find the challenge reward amount
    const allChallenges = [...dailyChallenges, ...weeklyChallenges];
    const challenge = allChallenges.find((c) => c.id === id);
    if (!challenge) return;

    try {
      const updatedData = await claimChallenge(user.uid, id, challenge.reward);
      updateLocal(updatedData);
    } catch (err) {
      console.error('[Challenges] Claim failed:', err);
    }

    if (type === 'daily') {
      setDailyChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, claimed: true } : c))
      );
    } else {
      setWeeklyChallenges((prev) =>
        prev.map((c) => (c.id === id ? { ...c, claimed: true } : c))
      );
    }
  };

  const rarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-neutral-300 dark:border-neutral-600';
      case 'rare': return 'border-primary-400 dark:border-primary-600';
      case 'epic': return 'border-secondary-400 dark:border-secondary-600';
      case 'legendary': return 'border-accent-400 dark:border-accent-600';
      default: return '';
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Target className="h-7 w-7 text-primary-500" />
          Challenges & Achievements
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Complete challenges to earn bonus points and unlock achievements
        </p>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card hoverable className="text-center !p-4">
          <span className="text-2xl">🔥</span>
          <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">{breakdown.streakDays}</p>
          <p className="text-[11px] text-neutral-500">Day Streak</p>
        </Card>
        <Card hoverable className="text-center !p-4">
          <span className="text-2xl">⭐</span>
          <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">{availablePoints}</p>
          <p className="text-[11px] text-neutral-500">Total Points</p>
        </Card>
        <Card hoverable className="text-center !p-4">
          <span className="text-2xl">🏅</span>
          <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">
            {achievements.filter((a) => a.unlocked).length}/{achievements.length}
          </p>
          <p className="text-[11px] text-neutral-500">Achievements</p>
        </Card>
        <Card hoverable className="text-center !p-4">
          <span className="text-2xl">🎯</span>
          <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">
            {dailyChallenges.filter((c) => c.current >= c.target).length + weeklyChallenges.filter((c) => c.current >= c.target).length}
          </p>
          <p className="text-[11px] text-neutral-500">Completed</p>
        </Card>
      </div>

      {/* Daily Challenges */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent-500" />
          Daily Challenges
          <Badge variant="accent" size="sm" className="ml-auto">
            Resets in {24 - new Date().getHours()}h
          </Badge>
        </CardTitle>
        <CardContent className="mt-4 space-y-3">
          {dailyChallenges.map((challenge) => {
            const completed = challenge.current >= challenge.target;
            return (
              <div
                key={challenge.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-[14px] border transition-all duration-200',
                  completed
                    ? 'bg-success-50 dark:bg-success-500/5 border-success-200 dark:border-success-700'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
                )}
              >
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{challenge.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{challenge.description}</p>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        completed ? 'bg-success-500' : 'bg-primary-500'
                      )}
                      style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {challenge.current}/{challenge.target}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {completed && !challengesClaimed.includes(challenge.id) ? (
                    <Button size="sm" variant="primary" onClick={() => handleClaim(challenge.id, 'daily')}>
                      <Gift className="h-3.5 w-3.5" />
                      Claim
                    </Button>
                  ) : challengesClaimed.includes(challenge.id) ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="h-3 w-3" /> Claimed
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">+{challenge.reward} pts</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Weekly Challenges */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary-500" />
          Weekly Challenges
          <Badge variant="secondary" size="sm" className="ml-auto">
            {7 - new Date().getDay()} days left
          </Badge>
        </CardTitle>
        <CardContent className="mt-4 space-y-3">
          {weeklyChallenges.map((challenge) => {
            const completed = challenge.current >= challenge.target;
            return (
              <div
                key={challenge.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-[14px] border transition-all duration-200',
                  completed
                    ? 'bg-success-50 dark:bg-success-500/5 border-success-200 dark:border-success-700'
                    : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700'
                )}
              >
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{challenge.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{challenge.description}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        completed ? 'bg-success-500' : 'bg-secondary-500'
                      )}
                      style={{ width: `${Math.min((challenge.current / challenge.target) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {challenge.current}/{challenge.target}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {completed && !challengesClaimed.includes(challenge.id) ? (
                    <Button size="sm" variant="secondary" onClick={() => handleClaim(challenge.id, 'weekly')}>
                      <Gift className="h-3.5 w-3.5" />
                      Claim
                    </Button>
                  ) : challengesClaimed.includes(challenge.id) ? (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="h-3 w-3" /> Claimed
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">+{challenge.reward} pts</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-danger-500" />
          Achievements
          <Badge variant="neutral" size="sm" className="ml-auto">
            {achievements.filter((a) => a.unlocked).length}/{achievements.length} Unlocked
          </Badge>
        </CardTitle>
        <CardContent className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-4 rounded-[14px] border-2 transition-all duration-200',
                  ach.unlocked
                    ? rarityColor(ach.rarity)
                    : 'border-neutral-200 dark:border-neutral-700 opacity-50 grayscale',
                  ach.unlocked && 'hover:scale-[1.02]'
                )}
              >
                {!ach.unlocked && (
                  <Lock className="absolute top-2 right-2 h-3.5 w-3.5 text-neutral-400" />
                )}
                <span className="text-3xl">{ach.icon}</span>
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-center">{ach.name}</p>
                <p className="text-[10px] text-neutral-400 text-center">{ach.description}</p>
                {ach.unlocked && (
                  <Badge
                    variant={ach.rarity === 'legendary' ? 'accent' : ach.rarity === 'epic' ? 'secondary' : ach.rarity === 'rare' ? 'primary' : 'neutral'}
                    size="sm"
                  >
                    {ach.rarity}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
