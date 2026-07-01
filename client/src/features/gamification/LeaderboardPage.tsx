import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Button, Avatar } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useRecentReports, useProfile } from '@/hooks';
import { cn } from '@/lib/utils';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  reportsCount: number;
  resolvedCount: number;
  points: number;
  level: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { reports } = useRecentReports(100);
  const { reputation } = useProfile(reports);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('displayName'), limit(50));
        const snap = await getDocs(q);

        // Build leaderboard from users + their reports
        const entries: LeaderboardEntry[] = [];
        for (const doc of snap.docs) {
          const data = doc.data();
          const reportsRef = collection(db, 'reports');
          const reportsQuery = query(reportsRef, orderBy('createdAt'));
          const reportsSnap = await getDocs(reportsQuery);

          const userReports = reportsSnap.docs.filter(
            (r) => r.data().userId === doc.id
          );
          const resolved = userReports.filter(
            (r) => r.data().status === 'resolved'
          );

          const pts = userReports.length * 10 + resolved.length * 25;

          entries.push({
            uid: doc.id,
            displayName: data.displayName || 'Anonymous',
            photoURL: data.photoURL || null,
            reportsCount: userReports.length,
            resolvedCount: resolved.length,
            points: pts,
            level: pts >= 1000 ? 'Legend' : pts >= 600 ? 'City Champion' : pts >= 350 ? 'Community Hero' : pts >= 150 ? 'Guardian' : pts >= 50 ? 'Volunteer' : 'Seed',
          });
        }

        entries.sort((a, b) => b.points - a.points);
        setLeaders(entries);
      } catch (err) {
        console.error('[Leaderboard] Error fetching:', err);
        // Fallback: use current user data
        if (user) {
          setLeaders([
            {
              uid: user.uid,
              displayName: user.displayName || 'You',
              photoURL: user.photoURL || null,
              reportsCount: reports.length,
              resolvedCount: reports.filter((r) => r.status === 'resolved').length,
              points: reputation.score,
              level: reputation.level,
            },
          ]);
        }
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, [user, reports, reputation, timeFilter]);

  const getMedal = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  const currentUserRank = leaders.findIndex((l) => l.uid === user?.uid);

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-7 w-7 text-accent-500" />
            Community Heroes
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Top contributors making our community better
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'month', 'week'] as const).map((f) => (
            <Button
              key={f}
              variant={timeFilter === f ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeFilter(f)}
            >
              {f === 'all' ? 'All Time' : f === 'month' ? 'This Month' : 'This Week'}
            </Button>
          ))}
        </div>
      </div>

      {/* Your Rank Card */}
      {user && (
        <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 text-white !border-0">
          <CardContent className="flex items-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 text-2xl font-bold">
              {currentUserRank >= 0 ? getMedal(currentUserRank) : '—'}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/70">Your Rank</p>
              <p className="text-xl font-bold">{user.displayName}</p>
              <p className="text-sm text-white/80">{reputation.score} points • {reputation.level}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">#{currentUserRank >= 0 ? currentUserRank + 1 : '—'}</p>
              <p className="text-xs text-white/70">of {leaders.length} heroes</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-accent-500" />
              Rankings
              <Badge variant="neutral" size="sm" className="ml-auto">
                {leaders.length} Heroes
              </Badge>
            </CardTitle>
            <CardContent className="mt-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-14 rounded-[14px] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                  ))}
                </div>
              ) : leaders.length === 0 ? (
                <p className="text-center text-neutral-400 py-8">No data yet. Start reporting issues!</p>
              ) : (
                <div className="space-y-2">
                  {leaders.map((entry, idx) => (
                    <div
                      key={entry.uid}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-[14px] transition-all duration-200',
                        entry.uid === user?.uid
                          ? 'bg-primary-50 dark:bg-primary-500/10 ring-1 ring-primary-200 dark:ring-primary-600'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                        idx < 3 && 'border border-accent-200 dark:border-accent-700/50'
                      )}
                    >
                      {/* Rank */}
                      <div className="w-10 text-center">
                        {idx < 3 ? (
                          <span className="text-2xl">{getMedal(idx)}</span>
                        ) : (
                          <span className="text-sm font-bold text-neutral-400">#{idx + 1}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar
                        fallback={entry.displayName}
                        src={entry.photoURL || undefined}
                        size="sm"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                          {entry.displayName}
                          {entry.uid === user?.uid && (
                            <Badge variant="primary" size="sm" className="ml-2">You</Badge>
                          )}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {entry.reportsCount} reports • {entry.resolvedCount} resolved
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{entry.points}</p>
                        <p className="text-[10px] text-neutral-400">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How to Earn Points */}
        <div className="space-y-6">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success-500" />
              How to Earn Points
            </CardTitle>
            <CardContent className="mt-4 space-y-3">
              {[
                { action: 'Submit a Report', points: '+10', icon: '📋', color: 'bg-primary-100 dark:bg-primary-500/10' },
                { action: 'Issue Resolved', points: '+25', icon: '✅', color: 'bg-success-100 dark:bg-success-500/10' },
                { action: 'Community Upvote', points: '+5', icon: '👍', color: 'bg-secondary-100 dark:bg-secondary-500/10' },
                { action: 'Daily Login Streak', points: '+3', icon: '🔥', color: 'bg-accent-100 dark:bg-accent-500/10' },
                { action: 'Complete Challenge', points: '+15', icon: '🎯', color: 'bg-danger-100 dark:bg-danger-500/10' },
                { action: 'Win Quiz', points: '+20', icon: '🧠', color: 'bg-neutral-100 dark:bg-neutral-800' },
              ].map((item) => (
                <div key={item.action} className={cn('flex items-center gap-3 p-3 rounded-[12px]', item.color)}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">{item.action}</span>
                  <span className="text-sm font-bold text-success-600 dark:text-success-400">{item.points}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent-500" />
              Top Achievements
            </CardTitle>
            <CardContent className="mt-4 space-y-2">
              {[
                { name: 'First Report', icon: '🌟', desc: 'Submit your first issue' },
                { name: '10 Reports', icon: '💪', desc: 'Submit 10 issues' },
                { name: 'Problem Solver', icon: '🧩', desc: '5 issues resolved' },
                { name: 'Streak Master', icon: '🔥', desc: '7-day login streak' },
              ].map((ach) => (
                <div key={ach.name} className="flex items-center gap-3 p-2">
                  <span className="text-lg">{ach.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">{ach.name}</p>
                    <p className="text-[10px] text-neutral-400">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
