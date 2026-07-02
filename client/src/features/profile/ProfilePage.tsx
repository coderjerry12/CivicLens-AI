import { useState } from 'react';
import { Trophy, Star, Target, Calendar, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Avatar, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useRecentReports, useProfile, usePoints } from '@/hooks';
import { LEVEL_THRESHOLDS } from '@/types/reputation';
import { cn, formatRelativeTime } from '@/lib/utils';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function ProfilePage() {
  const { user } = useAuth();
  const { reports, loading } = useRecentReports(100);
  const { reputation, badges, achievements, activityMap } = useProfile(reports);
  const { totalEarned } = usePoints();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!newName.trim() || !auth.currentUser) return;
    setSaving(true);
    try {
      const trimmedName = newName.trim();
      const uid = auth.currentUser.uid;

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { displayName: trimmedName });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', uid), { name: trimmedName });

      // Update reporter name on all user's existing issues
      const issuesRef = collection(db, 'issues');
      const userIssuesQuery = query(issuesRef, where('reporter.uid', '==', uid));
      const issuesSnap = await getDocs(userIssuesQuery);
      const updatePromises = issuesSnap.docs.map((issueDoc) =>
        updateDoc(doc(db, 'issues', issueDoc.id), { 'reporter.name': trimmedName })
      );
      await Promise.all(updatePromises);

      setEditingName(false);
      window.location.reload();
    } catch (err) {
      console.error('[Profile] Name update failed:', err);
    }
    setSaving(false);
  };

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
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-[10px] px-3 py-1.5 text-lg font-bold text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 w-48"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={saving}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Save name"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </button>
                  <button
                    onClick={() => { setEditingName(false); setNewName(user?.displayName || ''); }}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Cancel"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user?.displayName}</h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    aria-label="Edit name"
                  >
                    <Pencil className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              )}
              <p className="text-primary-100 text-sm">{user?.email}</p>
              {user?.role !== 'authority' && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl">{currentLevelData.icon}</span>
                  <span className="text-sm font-semibold">{reputation.level}</span>
                  <span className="text-primary-200 text-xs">• {totalEarned} points</span>
                </div>
              )}
              {user?.role === 'authority' && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="accent" size="sm">Authority</Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Level Progress — citizens only */}
        {user?.role !== 'authority' && (
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
        )}
      </Card>

      {/* Stats Breakdown — citizens only */}
      {user?.role !== 'authority' && (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat icon="📋" label="Reports" value={reputation.breakdown.reportsSubmitted} />
        <MiniStat icon="✅" label="Resolved" value={reputation.breakdown.resolvedReports} />
        <MiniStat icon="🔥" label="Streak" value={`${reputation.breakdown.streakDays}d`} />
        <MiniStat icon="⭐" label="Score" value={totalEarned} />
      </div>
      )}

      {user?.role !== 'authority' && (
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
      )}

      {/* Contribution Matrix — citizens only */}
      {user?.role !== 'authority' && (
      <>
      <Card>
        <CardTitle className="flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary-500" />
              Contribution Matrix
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal mt-1">
              {Object.values(activityMap).reduce((a, b) => a + b, 0)} reported issues in the last year
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
            <span>Less</span>
            <div className="h-3 w-3 rounded-sm bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-800" />
            <div className="h-3 w-3 rounded-sm bg-emerald-400 dark:bg-emerald-600" />
            <div className="h-3 w-3 rounded-sm bg-emerald-600 dark:bg-emerald-400" />
            <span>More</span>
          </div>
        </CardTitle>
        <CardContent className="mt-4">
          <ContributionMatrix activityMap={activityMap} reports={reports} />
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
              const reached = totalEarned >= lvl.minScore;
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
      </>
      )}

      {/* Authority Profile Sections */}
      {user?.role === 'authority' && (
      <>
        {/* Authority Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat icon="📥" label="Total Assigned" value={reports.length} />
          <MiniStat icon="✅" label="Resolved" value={reports.filter((r) => r.status === 'resolved').length} />
          <MiniStat icon="⏳" label="In Progress" value={reports.filter((r) => r.status === 'in_progress').length} />
          <MiniStat icon="📊" label="Resolution Rate" value={reports.length > 0 ? `${Math.round((reports.filter((r) => r.status === 'resolved').length / reports.length) * 100)}%` : '0%'} />
        </div>

        {/* Performance Overview */}
        <Card>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary-500" />
            Performance Overview
          </CardTitle>
          <CardContent className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Issue Resolution Rate</span>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                  {reports.length > 0 ? Math.round((reports.filter((r) => r.status === 'resolved').length / reports.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-success-500 to-primary-500 transition-all duration-1000"
                  style={{ width: `${reports.length > 0 ? Math.round((reports.filter((r) => r.status === 'resolved').length / reports.length) * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Response Efficiency</span>
                <span className="text-xs font-bold text-secondary-600 dark:text-secondary-400">
                  {reports.length > 0 ? Math.round((reports.filter((r) => r.status !== 'pending').length / reports.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-secondary-500 to-accent-500 transition-all duration-1000"
                  style={{ width: `${reports.length > 0 ? Math.round((reports.filter((r) => r.status !== 'pending').length / reports.length) * 100) : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department & Responsibilities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent-500" />
              Role & Access
            </CardTitle>
            <CardContent className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Role</span>
                <Badge variant="accent" size="sm">Authority</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Access Level</span>
                <Badge variant="primary" size="sm">Full Management</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Permissions</span>
                <Badge variant="success" size="sm">Resolve & Assign</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-[12px] bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Analytics</span>
                <Badge variant="secondary" size="sm">Full Dashboard</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-secondary-500" />
              Recent Activity
            </CardTitle>
            <CardContent className="mt-4 space-y-3">
              {reports.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No activity yet</p>
              ) : (
                reports.slice(0, 5).map((report) => (
                  <div key={report.documentId} className="flex items-center gap-3 p-2 rounded-[10px] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      report.status === 'resolved' ? 'bg-success-500' :
                      report.status === 'in_progress' ? 'bg-primary-500' : 'bg-neutral-300'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{report.title}</p>
                      <p className="text-[10px] text-neutral-400">{formatRelativeTime(report.createdAt)}</p>
                    </div>
                    <Badge variant={report.status === 'resolved' ? 'success' : report.status === 'in_progress' ? 'primary' : 'neutral'} size="sm">
                      {report.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </>
      )}
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

function ContributionMatrix({ activityMap, reports }: { activityMap: Record<string, number>; reports: { createdAt: Date; status: string }[] }) {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // Generate 365 days grid (7 rows x ~52 columns)
  const days: { date: string; count: number; dayOfWeek: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: activityMap[key] || 0, dayOfWeek: d.getDay() });
  }

  // Organize into weeks (columns)
  const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
  let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];

  // Pad the first week
  const firstDow = days[0].dayOfWeek;
  for (let i = 0; i < firstDow; i++) {
    currentWeek.push({ date: '', count: -1, dayOfWeek: i });
  }

  days.forEach((day) => {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Month labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthPositions: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, colIdx) => {
    const validDay = week.find((d) => d.date);
    if (validDay) {
      const month = new Date(validDay.date).getMonth();
      if (month !== lastMonth) {
        monthPositions.push({ label: months[month], col: colIdx });
        lastMonth = month;
      }
    }
  });

  // Stats
  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'resolved').length;
  const successRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0.0';

  // Calculate streaks
  const sortedDates = [...new Set(
    reports
      .map((r) => r.createdAt.toISOString().split('T')[0])
  )].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Current streak (from today going backwards)
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (activityMap[key] && activityMap[key] > 0) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const getCellColor = (count: number) => {
    if (count <= 0) return 'bg-neutral-200 dark:bg-neutral-700';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-800';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-400';
  };

  return (
    <div>
      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-0.5 min-w-[700px]">
          {/* Month labels */}
          <div className="flex gap-0.5 ml-0 mb-1">
            {weeks.map((_, colIdx) => {
              const mp = monthPositions.find((m) => m.col === colIdx);
              return (
                <div key={colIdx} className="w-[13px] text-center">
                  {mp && <span className="text-[9px] text-neutral-500 dark:text-neutral-400">{mp.label}</span>}
                </div>
              );
            })}
          </div>

          {/* Heatmap rows (7 days) */}
          {Array.from({ length: 7 }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex gap-0.5">
              {weeks.map((week, colIdx) => {
                const cell = week.find((d) => d.dayOfWeek === rowIdx);
                if (!cell || cell.count === -1) {
                  return <div key={colIdx} className="w-[13px] h-[13px]" />;
                }
                return (
                  <div
                    key={colIdx}
                    className={cn(
                      'w-[13px] h-[13px] rounded-[2px] transition-colors',
                      getCellColor(cell.count)
                    )}
                    title={`${cell.date}: ${cell.count} report${cell.count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">Longest Streak</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{longestStreak} Days</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">Current Streak</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{currentStreak} Days</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">Success Rate</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white">{successRate}%</p>
        </div>
      </div>
    </div>
  );
}
