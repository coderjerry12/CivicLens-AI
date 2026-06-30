import {
  BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle2,
  Brain, Target, MapPin, Lightbulb, ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, StatCard, Skeleton } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import { useAnalytics } from '@/hooks/useAnalytics';
import { generateForecasts, type Forecast } from '@/services/forecastService';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const { data, loading } = useAnalytics();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);

  useEffect(() => {
    generateForecasts().then(setForecasts).catch(() => {});
  }, []);

  if (loading) {
    return (
      <PageWrapper title="Analytics" description="Decision intelligence for authorities.">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-[20px]" />)}
        </div>
        <Skeleton className="h-64 rounded-[20px]" />
      </PageWrapper>
    );
  }

  if (!data) {
    return (
      <PageWrapper title="Analytics">
        <p className="text-sm text-neutral-500 text-center py-12">No data available.</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Analytics & Decision Intelligence" description="Real-time insights from community issue data.">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Issues" value={data.kpis.totalIssues} icon={<BarChart3 className="h-5 w-5" />} iconColor="text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-500/20" />
        <StatCard label="Resolution Rate" value={`${data.kpis.resolutionRate}%`} icon={<CheckCircle2 className="h-5 w-5" />} iconColor="text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-500/20" />
        <StatCard label="Avg Resolution" value={`${data.kpis.avgResolutionHours}h`} icon={<Clock className="h-5 w-5" />} iconColor="text-secondary-600 bg-secondary-50 dark:text-secondary-400 dark:bg-secondary-500/20" />
        <StatCard label="Critical Open" value={data.kpis.criticalOpen} icon={<AlertTriangle className="h-5 w-5" />} iconColor="text-danger-600 bg-danger-50 dark:text-danger-400 dark:bg-danger-500/20" />
        <StatCard label="New This Week" value={data.kpis.newThisWeek} icon={<TrendingUp className="h-5 w-5" />} iconColor="text-accent-600 bg-accent-50 dark:text-accent-400 dark:bg-accent-500/20" />
        <StatCard label="Resolved This Week" value={data.kpis.resolvedThisWeek} icon={<Target className="h-5 w-5" />} iconColor="text-success-600 bg-success-50 dark:text-success-400 dark:bg-success-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* 7-day Trend */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              7-Day Trend
            </CardTitle>
            <CardContent className="mt-4">
              <div className="flex items-end gap-1 h-32">
                {data.trendData.map((point) => (
                  <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center gap-0.5 flex-1 justify-end">
                      <div className="w-full max-w-[24px] bg-primary-500 rounded-t-sm transition-all duration-500" style={{ height: `${Math.max(point.reported * 20, 4)}px` }} title={`${point.reported} reported`} />
                      <div className="w-full max-w-[24px] bg-success-400 rounded-t-sm transition-all duration-500" style={{ height: `${Math.max(point.resolved * 20, 2)}px` }} title={`${point.resolved} resolved`} />
                    </div>
                    <span className="text-[9px] text-neutral-400 mt-1">{point.date.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 justify-center">
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary-500" /><span className="text-[10px] text-neutral-500">Reported</span></div>
                <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-success-400" /><span className="text-[10px] text-neutral-500">Resolved</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardTitle>Category Distribution</CardTitle>
            <CardContent className="mt-4 space-y-3">
              {data.categoryBreakdown.map((cat) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-xs text-neutral-600 dark:text-neutral-300 w-28 capitalize truncate">{cat.category.replace('_', ' ')}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-primary-500 transition-all duration-700" style={{ width: `${cat.percentage}%` }} />
                  </div>
                  <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200 w-8 text-right">{cat.count}</span>
                  <span className="text-[10px] text-success-600 w-12 text-right">{cat.resolved} ✓</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card>
            <CardTitle>Department Performance</CardTitle>
            <CardContent className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-neutral-500 dark:text-neutral-400 border-b border-border dark:border-neutral-700">
                      <th className="text-left py-2 font-medium">Department</th>
                      <th className="text-center py-2 font-medium">Total</th>
                      <th className="text-center py-2 font-medium">Pending</th>
                      <th className="text-center py-2 font-medium">Resolved</th>
                      <th className="text-center py-2 font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.departmentPerformance.map((dept) => (
                      <tr key={dept.department} className="border-b border-border/50 dark:border-neutral-800">
                        <td className="py-2 capitalize text-neutral-700 dark:text-neutral-200">{dept.department.replace('_', ' ')}</td>
                        <td className="py-2 text-center">{dept.total}</td>
                        <td className="py-2 text-center text-accent-600">{dept.pending}</td>
                        <td className="py-2 text-center text-success-600">{dept.resolved}</td>
                        <td className="py-2 text-center">
                          <Badge variant={dept.resolutionRate >= 60 ? 'success' : dept.resolutionRate >= 30 ? 'accent' : 'danger'} size="sm">
                            {dept.resolutionRate}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* AI Decisions */}
          <Card className="border-primary-200 dark:border-primary-500/20 bg-gradient-to-br from-white to-primary-50/30 dark:from-neutral-900 dark:to-primary-950/20">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              AI Decisions
            </CardTitle>
            <CardContent className="mt-4 space-y-3">
              {data.decisions.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No recommendations at this time.</p>
              ) : (
                data.decisions.map((d) => (
                  <div key={d.id} className={cn(
                    'flex items-start gap-2.5 rounded-[10px] border p-3',
                    d.type === 'warning' && 'bg-danger-50 dark:bg-danger-500/5 border-danger-200 dark:border-danger-500/20',
                    d.type === 'recommendation' && 'bg-accent-50 dark:bg-accent-500/5 border-accent-200 dark:border-accent-500/20',
                    d.type === 'insight' && 'bg-primary-50 dark:bg-primary-500/5 border-primary-200 dark:border-primary-500/20',
                  )}>
                    <div className="mt-0.5 shrink-0">
                      {d.type === 'warning' && <ShieldAlert className="h-4 w-4 text-danger-600 dark:text-danger-400" />}
                      {d.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-accent-600 dark:text-accent-400" />}
                      {d.type === 'insight' && <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{d.title}</p>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">{d.description}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardTitle className="text-sm">Priority Distribution</CardTitle>
            <CardContent className="mt-3">
              <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                {data.priorityDistribution.map((p) => (
                  <div key={p.label} className={cn('transition-all duration-700', p.color)} style={{ width: `${p.percentage}%` }} title={`${p.label}: ${p.count}`} />
                ))}
              </div>
              <div className="space-y-2">
                {data.priorityDistribution.map((p) => (
                  <div key={p.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-2.5 w-2.5 rounded-full', p.color)} />
                      <span className="text-xs text-neutral-600 dark:text-neutral-300 capitalize">{p.label}</span>
                    </div>
                    <span className="text-xs font-medium text-neutral-700 dark:text-neutral-200">{p.count} ({p.percentage}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hotspots */}
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-danger-500" />
              Hotspot Areas
            </CardTitle>
            <CardContent className="mt-3 space-y-2">
              {data.hotspots.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-[8px] bg-neutral-50 dark:bg-neutral-800 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-[11px] text-neutral-700 dark:text-neutral-200 truncate max-w-[160px]">{h.area}</p>
                    <p className="text-[9px] text-neutral-400 capitalize">{h.topCategory.replace('_', ' ')}</p>
                  </div>
                  <Badge variant="neutral" size="sm">{h.count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Predictive Forecasts */}
          {forecasts.length > 0 && (
            <Card className="border-secondary-200 dark:border-secondary-500/20 bg-gradient-to-br from-white to-secondary-50/30 dark:from-neutral-900 dark:to-secondary-950/20">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-secondary-500" />
                AI Forecasts
              </CardTitle>
              <CardContent className="mt-3 space-y-2">
                {forecasts.map((f) => (
                  <div key={f.id} className="rounded-[10px] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 p-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">{f.title}</p>
                      <span className={cn(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded',
                        f.trend === 'up' ? 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400' :
                        f.trend === 'down' ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400' :
                        'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                      )}>
                        {f.trend === 'up' ? '↑' : f.trend === 'down' ? '↓' : '→'} {f.confidence}%
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">{f.prediction}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
