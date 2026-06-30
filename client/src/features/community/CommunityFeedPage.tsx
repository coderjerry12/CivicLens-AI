import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, MessageSquare, Brain, Users } from 'lucide-react';
import { Badge, Skeleton, SearchBar, FilterChip } from '@/components/ui';
import { EmptyState } from '@/components/shared';
import { PageWrapper } from '@/components/layout';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { verifyIssue } from '@/services/communityFeedService';
import { useAuth } from '@/features/auth';
import { formatRelativeTime } from '@/lib/utils';
import { CATEGORY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from '@/types/filter';

export default function CommunityFeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { issues, loading, filters, setFilters, refresh } = useCommunityFeed();

  const handleVerify = async (issueId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const success = await verifyIssue(issueId, user.uid, user.displayName || 'User');
    if (success) refresh();
  };

  return (
    <PageWrapper title="Community Feed" description="Discover, verify and discuss issues in your area.">
      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar
          value={filters.search}
          onChange={(v) => setFilters({ ...filters, search: v })}
          placeholder="Search community issues..."
          className="flex-1"
        />
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as 'newest' | 'most_verified' })}
          className="h-10 rounded-[14px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="newest">Newest</option>
          <option value="most_verified">Most Verified</option>
        </select>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORY_FILTER_OPTIONS.slice(0, 5).map((o) => (
          <FilterChip key={o.value} label={o.label} active={filters.category === o.value} onClick={() => setFilters({ ...filters, category: filters.category === o.value ? null : o.value })} />
        ))}
        {STATUS_FILTER_OPTIONS.map((o) => (
          <FilterChip key={o.value} label={o.label} active={filters.status === o.value} onClick={() => setFilters({ ...filters, status: filters.status === o.value ? null : o.value })} />
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[20px]" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && issues.length === 0 && (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="No Community Issues"
          description="No issues match your filters. Try adjusting or report the first issue."
          actionLabel="Report Issue"
          onAction={() => navigate('/app/issues/new')}
        />
      )}

      {/* Feed */}
      {!loading && issues.length > 0 && (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div
              key={issue.documentId}
              className="rounded-[20px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-900 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onClick={() => navigate(`/app/issues/${issue.documentId}`)}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Thumbnail */}
                {issue.imageDataURL && (
                  <div className="sm:w-40 h-32 sm:h-auto shrink-0">
                    <img src={issue.imageDataURL} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary dark:text-white">{issue.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-neutral-400">{issue.trackingId}</span>
                        <span className="text-neutral-300 dark:text-neutral-600">·</span>
                        <span className="text-[10px] text-neutral-400">{formatRelativeTime(issue.createdAt)}</span>
                        <span className="text-neutral-300 dark:text-neutral-600">·</span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{issue.address.split(',')[0]}</span>
                      </div>
                    </div>
                    <Badge variant={issue.severity === 'critical' ? 'danger' : issue.severity === 'high' ? 'accent' : 'primary'} size="sm">
                      {issue.severity}
                    </Badge>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={(e) => handleVerify(issue.documentId, e)}
                      className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-success-600 dark:hover:text-success-400 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {issue.verificationCount} verified
                    </button>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {issue.commentCount} comments
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <Brain className="h-3.5 w-3.5" />
                      {issue.aiConfidence}% AI
                    </span>
                    <Badge variant="neutral" size="sm" className="ml-auto capitalize">
                      {issue.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
