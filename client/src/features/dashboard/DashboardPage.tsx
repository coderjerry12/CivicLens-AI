import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Globe,
  ClipboardList,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  MapPin,
  Brain,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardTitle, StatCard, Badge, Button, Skeleton, SearchBar, FilterChip } from '@/components/ui';
import { EmptyState } from '@/components/shared';
import { useAuth } from '@/features/auth';
import { useDashboardStats, useRecentReports, useReportFilters, useDashboardInsights, useCommunityInsights } from '@/hooks';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { CATEGORY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, SEVERITY_FILTER_OPTIONS, SORT_OPTIONS } from '@/types/filter';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useDashboardStats();
  const { reports, loading: reportsLoading } = useRecentReports(20);
  const insights = useDashboardInsights(reports, stats, user?.displayName || 'User');
  const { insights: communityData, loading: communityLoading } = useCommunityInsights(); // Fetch more for filtering
  const {
    filters,
    filteredReports,
    activeCount,
    resultCount,
    setSearch,
    setCategory,
    setStatus,
    setSeverity,
    setSortBy,
    clearAll,
  } = useReportFilters(reports);

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="rounded-[20px] bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 p-6 sm:p-8 text-white relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative z-10">
          <p className="text-primary-200 text-sm">{today}</p>
          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            {greeting}, {user?.displayName?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-primary-100 text-sm mt-2 max-w-lg">
            {insights.welcomeMessage}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickActionCard
          icon={<PlusCircle className="h-6 w-6" />}
          title="Report New Issue"
          description="Upload a photo and let AI help"
          onClick={() => navigate('/app/issues/new')}
          gradient="from-primary-500 to-primary-600"
        />
        <QuickActionCard
          icon={<Globe className="h-6 w-6" />}
          title="Community Feed"
          description="See nearby reports"
          onClick={() => navigate('/app/map')}
          gradient="from-secondary-500 to-secondary-600"
        />
        <QuickActionCard
          icon={<ClipboardList className="h-6 w-6" />}
          title="My Reports"
          description="Track your submissions"
          onClick={() => navigate('/app/issues')}
          gradient="from-accent-500 to-accent-600"
        />
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            <Skeleton className="h-28 rounded-[20px]" />
            <Skeleton className="h-28 rounded-[20px]" />
            <Skeleton className="h-28 rounded-[20px]" />
            <Skeleton className="h-28 rounded-[20px]" />
          </>
        ) : (
          <>
            <StatCard
              label="Reports Submitted"
              value={stats?.totalReports ?? 0}
              icon={<ClipboardList className="h-5 w-5" />}
              iconColor="text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-500/20"
            />
            <StatCard
              label="Resolved"
              value={stats?.resolved ?? 0}
              icon={<CheckCircle2 className="h-5 w-5" />}
              iconColor="text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-500/20"
            />
            <StatCard
              label="Active Issues"
              value={(stats?.pending ?? 0) + (stats?.inProgress ?? 0)}
              icon={<Clock className="h-5 w-5" />}
              iconColor="text-accent-600 bg-accent-50 dark:text-accent-400 dark:bg-accent-500/20"
            />
            <StatCard
              label="Community Impact"
              value={`${stats?.communityImpact.score ?? 0}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              iconColor="text-secondary-600 bg-secondary-50 dark:text-secondary-400 dark:bg-secondary-500/20"
              trend={stats?.communityImpact.level ? undefined : undefined}
            />
          </>
        )}
      </div>

      {/* Community Level Badge */}
      {stats && !statsLoading && (
        <div className="flex items-center gap-3 rounded-[14px] border border-secondary-200 dark:border-secondary-500/20 bg-secondary-50 dark:bg-secondary-500/5 px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
          <p className="text-sm text-secondary-800 dark:text-secondary-300">
            <span className="font-semibold">{stats.communityImpact.level}</span>
            <span className="text-secondary-600 dark:text-secondary-400"> — {stats.communityImpact.score}% community impact score</span>
          </p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reports */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>My Reports</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/issues')}>
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <CardContent className="mt-4">
              {/* Search + Sort */}
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <SearchBar
                  value={filters.search}
                  onChange={setSearch}
                  placeholder="Search by title, category, or ID..."
                  className="flex-1"
                />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof filters.sortBy)}
                  className="h-10 rounded-[14px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 px-3 text-sm text-text-primary dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Sort reports"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORY_FILTER_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filters.category === opt.value}
                    onClick={() => setCategory(filters.category === opt.value ? null : opt.value)}
                  />
                ))}
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filters.status === opt.value}
                    onClick={() => setStatus(filters.status === opt.value ? null : opt.value)}
                  />
                ))}
                {SEVERITY_FILTER_OPTIONS.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filters.severity === opt.value}
                    onClick={() => setSeverity(filters.severity === opt.value ? null : opt.value)}
                  />
                ))}
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-danger-600 dark:text-danger-400 hover:underline ml-1"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Results count */}
              {!reportsLoading && reports.length > 0 && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  Showing {resultCount} of {reports.length} reports
                </p>
              )}

              {/* Loading */}
              {reportsLoading && (
                <div className="space-y-3">
                  <Skeleton className="h-16 rounded-[14px]" />
                  <Skeleton className="h-16 rounded-[14px]" />
                  <Skeleton className="h-16 rounded-[14px]" />
                </div>
              )}

              {/* Empty — no reports at all */}
              {!reportsLoading && reports.length === 0 && (
                <EmptyState
                  icon={<ClipboardList className="h-8 w-8" />}
                  title="No Reports Yet"
                  description="You haven't reported any issues. Start by reporting your first community issue."
                  actionLabel="Report New Issue"
                  onAction={() => navigate('/app/issues/new')}
                />
              )}

              {/* Empty — no filter results */}
              {!reportsLoading && reports.length > 0 && filteredReports.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-2">No reports match your filters</p>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Report List */}
              {!reportsLoading && filteredReports.length > 0 && (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.documentId}
                      className="flex items-center gap-3 rounded-[14px] border border-border dark:border-neutral-700 p-3 hover:bg-surface-hover dark:hover:bg-neutral-800 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                      onClick={() => navigate(`/app/issues/${report.documentId}`)}
                    >
                      {/* Thumbnail */}
                      <div className="h-12 w-12 shrink-0 rounded-[10px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                        {report.imageDataURL ? (
                          <img src={report.imageDataURL} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-neutral-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                          {report.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-neutral-400 font-mono">{report.trackingId}</span>
                          <span className="text-neutral-300 dark:text-neutral-600">·</span>
                          <span className="text-[11px] text-neutral-400">{formatRelativeTime(report.createdAt)}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant={getStatusVariant(report.status)} size="sm">
                          {formatStatus(report.status)}
                        </Badge>
                        <span className="text-[10px] text-neutral-400 capitalize">{report.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Insights */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              Community Insights
            </CardTitle>
            <CardContent className="mt-4">
              {communityLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 rounded-lg w-3/4" />
                  <Skeleton className="h-32 rounded-[14px]" />
                  <Skeleton className="h-24 rounded-[14px]" />
                </div>
              ) : !communityData || communityData.totalCommunityReports === 0 ? (
                <div className="rounded-[14px] bg-neutral-50 dark:bg-neutral-800 p-6 text-center">
                  <BarChart3 className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">No community data yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Submit reports to see community analytics here.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* AI Summary */}
                  <div className="rounded-[12px] bg-primary-50 dark:bg-primary-500/5 border border-primary-200 dark:border-primary-500/20 p-3">
                    <p className="text-xs text-primary-800 dark:text-primary-300 leading-relaxed">
                      🤖 {communityData.aiSummary}
                    </p>
                  </div>

                  {/* Category Distribution */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Trending Categories</p>
                    <div className="space-y-2">
                      {communityData.categoryDistribution.slice(0, 4).map((cat) => (
                        <div key={cat.category} className="flex items-center gap-3">
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 w-24 capitalize truncate">
                            {cat.category.replace('_', ' ')}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary-500 transition-all duration-700"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300 w-8 text-right">
                            {cat.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Status Overview</p>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                      {communityData.statusDistribution.map((s) => (
                        <div
                          key={s.status}
                          className={cn('transition-all duration-700', s.color)}
                          style={{ width: `${s.percentage}%` }}
                          title={`${s.status}: ${s.count}`}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {communityData.statusDistribution.map((s) => (
                        <div key={s.status} className="flex items-center gap-1.5">
                          <div className={cn('h-2 w-2 rounded-full', s.color)} />
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {s.status} ({s.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Performance */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-3 text-center">
                      <p className="text-lg font-bold text-success-600 dark:text-success-400">{communityData.resolutionRate}%</p>
                      <p className="text-[10px] text-neutral-500">Resolution Rate</p>
                    </div>
                    <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-3 text-center">
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{communityData.avgResolutionDays}d</p>
                      <p className="text-[10px] text-neutral-500">Avg Resolution</p>
                    </div>
                  </div>

                  {/* Hotspot Areas */}
                  {communityData.hotspotAreas.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Hotspot Areas</p>
                      <div className="space-y-1.5">
                        {communityData.hotspotAreas.slice(0, 3).map((area, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-[8px] bg-neutral-50 dark:bg-neutral-800 px-3 py-2">
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">
                              📍 {area.area}
                            </span>
                            <Badge variant="neutral" size="sm">{area.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="border-primary-200 dark:border-primary-500/20 bg-gradient-to-br from-white to-primary-50/30 dark:from-neutral-900 dark:to-primary-950/20">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              AI Insights
            </CardTitle>
            <CardContent className="mt-4 space-y-3">
              {insights.insightCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-start gap-2.5 rounded-[10px] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-3 hover:shadow-sm transition-shadow"
                >
                  <div className={cn(
                    'mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-full',
                    card.color === 'primary' && 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400',
                    card.color === 'success' && 'bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400',
                    card.color === 'accent' && 'bg-accent-100 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400',
                    card.color === 'secondary' && 'bg-secondary-100 dark:bg-secondary-500/20 text-secondary-600 dark:text-secondary-400',
                    card.color === 'danger' && 'bg-danger-100 dark:bg-danger-500/20 text-danger-600 dark:text-danger-400',
                  )}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{card.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{card.description}</p>
                  </div>
                  {card.metric && (
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full shrink-0">
                      {card.metric}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Daily Summary */}
          <Card className="bg-neutral-900 dark:bg-neutral-900 border-neutral-800 dark:border-neutral-700">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary-400" />
              Daily Summary
            </CardTitle>
            <CardContent className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Top Category</span>
                <span className="text-xs font-medium text-neutral-200 capitalize">{insights.dailySummary.topCategory.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Resolved Issues</span>
                <span className="text-xs font-medium text-success-400">{insights.dailySummary.resolvedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Community Trend</span>
                <Badge
                  variant={insights.dailySummary.communityTrend === 'improving' ? 'success' : insights.dailySummary.communityTrend === 'stable' ? 'accent' : 'danger'}
                  size="sm"
                >
                  {insights.dailySummary.communityTrend}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">AI Confidence</span>
                <span className="text-xs font-medium text-primary-400">{insights.dailySummary.confidence}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-neutral-500" />
              Activity
            </CardTitle>
            <CardContent className="mt-4">
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/20">
                        <div className="h-2 w-2 rounded-full bg-primary-500" />
                      </div>
                      {idx < activities.length - 1 && (
                        <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-700 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-text-primary dark:text-neutral-200">{activity.text}</p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Placeholder */}
          <Card className="border-dashed border-neutral-300 dark:border-neutral-700">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-accent-500" />
              Achievements
            </CardTitle>
            <CardContent className="mt-3">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center py-4">
                Badges and milestones will appear here as you contribute.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-[16px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-900 p-4 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-500/30"
    >
      <div className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br text-white transition-transform duration-300 group-hover:scale-110',
        gradient
      )}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary dark:text-white">{title}</p>
        <p className="text-xs text-text-muted dark:text-neutral-400">{description}</p>
      </div>
    </button>
  );
}

// ─── Helpers ───

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ─── Placeholder Data ───

const activities = [
  { text: 'Your pothole report was assigned to Public Works', time: '2 hours ago' },
  { text: 'Streetlight issue verified by 3 community members', time: '5 hours ago' },
  { text: 'Water leakage at junction marked as Resolved', time: '1 day ago' },
  { text: 'You reported: Garbage overflow at dumpyard', time: '2 days ago' },
  { text: 'Profile setup completed', time: '3 days ago' },
];

// ─── Status Helpers ───

function getStatusVariant(status: string): 'success' | 'accent' | 'primary' | 'neutral' {
  switch (status) {
    case 'resolved':
    case 'closed':
      return 'success';
    case 'pending':
    case 'validated':
      return 'accent';
    case 'in_progress':
      return 'primary';
    default:
      return 'neutral';
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'validated': return 'Validated';
    case 'in_progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    default: return status;
  }
}
