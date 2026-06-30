import { Trophy, Star, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Avatar, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useRecentReports, useProfile } from '@/hooks';
import { LEVEL_THRESHOLDS } from '@/types/reputation';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useAuth();
  const { reports, loading } = useRecentReports(100);
  const { reputation, badges, achievements, activityMap } = useProfile(reports);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Skeleton className="h-48 rounded-[20px]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-24 rounded-[20px]" />
        </div>
        <Skeleton className="h-64 rounded-[20px]" />
      </div>
    );
  }

  const currentLevelData = LEVEL_THRESHOLDS.find((t) => t.level === reputation.level)!;

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Profile Hero */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 p-6 sm:p-8 text-white relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <Avatar
              fallback={user?.displayName || 'U'}
              src={user?.photoURL || undefined}
              size="lg"
              className="ring-4 ring-white/30 h-20 w-20 text-2xl"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">{user?.displayName}</h1>
              <p className="text-primary-100 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{currentLevelData.icon}</span>
                <span className="text-sm font-semibold">{reputation.level}</span>
                <span className="text-primary-200 text-xs">• {reputation.score} points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
              {reputation.level}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {reputation.nextLevel ? `${reputation.pointsToNext} pts to ${reputation.nextLevel}` : 'Max Level!'}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-1000"
              style={{ width: `${reputation.progressToNext}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon="📋" label="Reports" value={reputation.breakdown.reportsSubmitted} />
        <MiniStat icon="✅" label="Resolved" value={reputation.breakdown.resolvedReports} />
        <MiniStat icon="🔥" label="Streak" value={`${reputation.breakdown.streakDays}d`} />
        <MiniStat icon="⭐" label="Score" value={reputation.score} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent-500" />
            Badges
            <Badge variant="neutral" size="sm" className="ml-auto">
              {badges.filter((b) => b.unlocked).length}/{badges.length}
            </Badge>
          </CardTitle>
          <CardContent className="mt-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-[10px] transition-all duration-200',
                    badge.unlocked
                      ? 'hover:bg-accent-50 dark:hover:bg-accent-500/10 cursor-default'
                      : 'opacity-40 grayscale'
                  )}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-[9px] text-neutral-600 dark:text-neutral-400 text-center leading-tight truncate w-full">
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary-500" />
            Achievements
          </CardTitle>
          <CardContent className="mt-4 space-y-3">
            {achievements.map((ach) => (
              <div key={ach.id} className="flex items-center gap-3">
                <span className="text-lg">{ach.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{ach.name}</span>
                    <span className="text-[10px] text-neutral-400">{ach.current}/{ach.target}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mt-1">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        ach.completed ? 'bg-success-500' : 'bg-primary-500'
                      )}
                      style={{ width: `${Math.round((ach.current / ach.target) * 100)}%` }}
                    />
                  </div>
                </div>
                {ach.completed && <span className="text-success-500 text-xs">✓</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activity Calendar */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-secondary-500" />
          Activity Calendar
          <span className="text-xs text-neutral-400 ml-auto">Last 90 days</span>
        </CardTitle>
        <CardContent className="mt-4">
          <ActivityHeatmap activityMap={activityMap} />
        </CardContent>
      </Card>

      {/* Level Roadmap */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-accent-500" />
          Level Roadmap
        </CardTitle>
        <CardContent className="mt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {LEVEL_THRESHOLDS.map((lvl, idx) => {
              const reached = reputation.score >= lvl.minScore;
              return (
                <div key={lvl.level} className="flex items-center">
                  <div className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-[10px] min-w-[80px] transition-all',
                    reached ? 'bg-primary-50 dark:bg-primary-500/10' : 'opacity-50'
                  )}>
                    <span className="text-xl">{lvl.icon}</span>
                    <span className="text-[10px] font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">{lvl.level}</span>
                    <span className="text-[9px] text-neutral-400">{lvl.minScore} pts</span>
                  </div>
                  {idx < LEVEL_THRESHOLDS.length - 1 && (
                    <div className={cn(
                      'h-0.5 w-6 mx-1',
                      reached ? 'bg-primary-400' : 'bg-neutral-300 dark:bg-neutral-600'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ───

function MiniStat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <Card hoverable className="text-center !p-4">
      <span className="text-2xl">{icon}</span>
      <p className="text-lg font-bold text-text-primary dark:text-white mt-1">{value}</p>
      <p className="text-[11px] text-neutral-500">{label}</p>
    </Card>
  );
}

function ActivityHeatmap({ activityMap }: { activityMap: Record<string, number> }) {
  // Generate last 90 days
  const days: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: activityMap[key] || 0 });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map((day) => (
        <div
          key={day.date}
          className={cn(
            'h-3 w-3 rounded-sm transition-colors',
            day.count === 0 && 'bg-neutral-100 dark:bg-neutral-800',
            day.count === 1 && 'bg-primary-200 dark:bg-primary-700',
            day.count === 2 && 'bg-primary-400 dark:bg-primary-500',
            day.count >= 3 && 'bg-primary-600 dark:bg-primary-400',
          )}
          title={`${day.date}: ${day.count} report${day.count !== 1 ? 's' : ''}`}
        />
      ))}
    </div>
  );
}
