import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Map,
  Download,
  ArrowRight,
  Brain,
  Activity,
  Users,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardTitle, StatCard, Badge, Button, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useAuthorityDashboard } from '@/hooks/useAuthorityDashboard';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AuthorityDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading } = useAuthorityDashboard();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Skeleton className="h-40 rounded-[20px]" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[20px]" />)}
        </div>
        <Skeleton className="h-64 rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="rounded-[20px] bg-gradient-to-r from-neutral-900 to-neutral-800 p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <p className="text-neutral-400 text-sm">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {greeting}, {user?.displayName?.split(' ')[0] || 'Authority'} 🏛️
          </h1>
          {/* AI Operations Summary */}
          {data?.aiSummary && (
            <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-white/5 border border-white/10 px-3 py-2.5 max-w-2xl">
              <Brain className="h-4 w-4 text-primary-400 shrink-0 mt-0.5" />
              <p className="text-sm text-neutral-300 leading-relaxed">{data.aiSummary}</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Issues"
          value={data?.stats.total ?? 0}
          icon={<ClipboardList className="h-5 w-5" />}
          iconColor="text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-500/20"
        />
        <StatCard
          label="Pending"
          value={data?.stats.pending ?? 0}
          icon={<Inbox className="h-5 w-5" />}
          iconColor="text-accent-600 bg-accent-50 dark:text-accent-400 dark:bg-accent-500/20"
        />
        <StatCard
          label="In Progress"
          value={data?.stats.inProgress ?? 0}
          icon={<Clock className="h-5 w-5" />}
          iconColor="text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-500/20"
        />
        <StatCard
          label="Resolved"
          value={data?.stats.resolved ?? 0}
          icon={<CheckCircle2 className="h-5 w-5" />}
          iconColor="text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-500/20"
        />
        <StatCard
          label="Critical"
          value={data?.stats.critical ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          iconColor="text-danger-600 bg-danger-50 dark:text-danger-400 dark:bg-danger-500/20"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Priority Issues */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-danger-500" />
                Priority Issues
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/issues')}>
                All Issues <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <CardContent className="mt-4 space-y-3">
              {(!data?.priorityIssues || data.priorityIssues.length === 0) ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-6">
                  No priority issues. All clear! ✅
                </p>
              ) : (
                data.priorityIssues.map((issue) => (
                  <div
                    key={issue.documentId}
                    className="flex items-center gap-3 rounded-[14px] border border-border dark:border-neutral-700 p-3 hover:bg-surface-hover dark:hover:bg-neutral-800 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                    onClick={() => navigate(`/app/issues/${issue.documentId}`)}
                  >
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]',
                      issue.severity === 'critical' ? 'bg-danger-50 dark:bg-danger-500/20 text-danger-600 dark:text-danger-400' :
                      issue.severity === 'high' ? 'bg-accent-50 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400' :
                      'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                    )}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary dark:text-white truncate">{issue.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-neutral-400 capitalize">{issue.category.replace('_', ' ')}</span>
                        <span className="text-neutral-300 dark:text-neutral-600">·</span>
                        <span className="text-[11px] text-neutral-400">{formatRelativeTime(issue.reportedAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={issue.severity === 'critical' ? 'danger' : 'accent'} size="sm">
                        {issue.severity}
                      </Badge>
                      <span className="text-[10px] text-neutral-400 capitalize">{issue.department.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction icon={<ClipboardList className="h-5 w-5" />} label="All Issues" onClick={() => navigate('/app/issues')} />
            <QuickAction icon={<Map className="h-5 w-5" />} label="Map View" onClick={() => navigate('/app/map')} />
            <QuickAction icon={<BarChart3 className="h-5 w-5" />} label="Analytics" onClick={() => navigate('/app/analytics')} />
            <QuickAction icon={<Download className="h-5 w-5" />} label="Export" onClick={() => {}} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Department Workload */}
          <Card className="bg-neutral-900 dark:bg-neutral-900 border-neutral-800">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-primary-400" />
              Department Workload
            </CardTitle>
            <CardContent className="mt-3 space-y-3">
              <WorkloadRow label="Assigned Today" value={data?.workload.assignedToday ?? 0} />
              <WorkloadRow label="Resolved Today" value={data?.workload.resolvedToday ?? 0} />
              <WorkloadRow label="Avg Resolution" value={`${data?.workload.avgResolutionHours ?? 0}h`} />
              <WorkloadRow label="Backlog" value={data?.workload.backlog ?? 0} highlight />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary-500" />
              Recent Activity
            </CardTitle>
            <CardContent className="mt-4">
              {(!data?.recentActivity || data.recentActivity.length === 0) ? (
                <p className="text-xs text-neutral-400 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {data.recentActivity.map((entry, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full',
                          entry.type === 'resolved' ? 'bg-success-50 dark:bg-success-500/20' :
                          entry.type === 'status_change' ? 'bg-primary-50 dark:bg-primary-500/20' :
                          'bg-accent-50 dark:bg-accent-500/20'
                        )}>
                          <div className={cn(
                            'h-2 w-2 rounded-full',
                            entry.type === 'resolved' ? 'bg-success-500' :
                            entry.type === 'status_change' ? 'bg-primary-500' :
                            'bg-accent-500'
                          )} />
                        </div>
                        {idx < data.recentActivity.length - 1 && (
                          <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-700 mt-1" />
                        )}
                      </div>
                      <div className="pb-3 min-w-0">
                        <p className="text-xs font-medium text-text-primary dark:text-neutral-200">{entry.action}</p>
                        <p className="text-[11px] text-neutral-400 truncate">{entry.issueTitle}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{formatRelativeTime(entry.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-[14px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-900 p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="text-primary-600 dark:text-primary-400">{icon}</div>
      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{label}</span>
    </button>
  );
}

function WorkloadRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className={cn(
        'text-xs font-semibold',
        highlight ? 'text-accent-400' : 'text-neutral-200'
      )}>{value}</span>
    </div>
  );
}
