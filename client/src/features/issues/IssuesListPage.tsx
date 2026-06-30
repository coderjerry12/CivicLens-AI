import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Table2,
  LayoutGrid,
  MapPin,
  X,
} from 'lucide-react';
import { Card, Badge, Button, Skeleton, FilterChip, SearchBar } from '@/components/ui';
import { EmptyState } from '@/components/shared';
import { PageWrapper } from '@/components/layout';
import { useIssueQueue } from '@/hooks/useIssueQueue';
import { useIssueFilters } from '@/hooks/useIssueFilters';
import { useBulkActions } from '@/hooks/useBulkActions';
import { formatRelativeTime, cn } from '@/lib/utils';
import {
  QUEUE_SORT_OPTIONS,
  type ViewMode,
} from '@/types/issueQueue';
import { CATEGORY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, SEVERITY_FILTER_OPTIONS } from '@/types/filter';

export default function IssuesListPage() {
  const navigate = useNavigate();
  const { issues, loading, refresh } = useIssueQueue();
  const {
    filters, filteredIssues, activeFilterCount, resultCount,
    setSearch, setStatus, setSeverity, setCategory, setSortBy, clearAll,
    selectedIds, toggleSelect, deselectAll, selectAll,
  } = useIssueFilters(issues);
  const { bulkState, updateStatus: bulkUpdateStatus, assignDepartment: bulkAssign, updateSeverity: bulkSeverity, exportCSV } = useBulkActions(refresh);

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkValue, setBulkValue] = useState<string>('');

  return (
    <PageWrapper title="Issue Queue" description="Manage and prioritize community reports.">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchBar
          value={filters.search}
          onChange={setSearch}
          placeholder="Search issues..."
          className="flex-1"
        />
        <div className="flex gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof filters.sortBy)}
            className="h-10 rounded-[14px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Sort"
          >
            {QUEUE_SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex rounded-[14px] border border-border dark:border-neutral-700 overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={cn('px-3 py-2 transition-colors', viewMode === 'table' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800')}
              aria-label="Table view"
            >
              <Table2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn('px-3 py-2 transition-colors', viewMode === 'kanban' ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800')}
              aria-label="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTER_OPTIONS.map((o) => (
          <FilterChip key={o.value} label={o.label} active={filters.status === o.value} onClick={() => setStatus(filters.status === o.value ? null : o.value)} />
        ))}
        {SEVERITY_FILTER_OPTIONS.map((o) => (
          <FilterChip key={o.value} label={o.label} active={filters.severity === o.value} onClick={() => setSeverity(filters.severity === o.value ? null : o.value)} />
        ))}
        {CATEGORY_FILTER_OPTIONS.slice(0, 4).map((o) => (
          <FilterChip key={o.value} label={o.label} active={filters.category === o.value} onClick={() => setCategory(filters.category === o.value ? null : o.value)} />
        ))}
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs text-danger-600 dark:text-danger-400 hover:underline ml-1">Clear all</button>
        )}
      </div>

      {/* Results info + batch */}
      {!loading && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {resultCount} issue{resultCount !== 1 ? 's' : ''}
            {activeFilterCount > 0 && ` (filtered)`}
          </p>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <span className="text-xs text-primary-600 dark:text-primary-400">{selectedIds.size} selected</span>
                <button onClick={deselectAll} className="text-xs text-neutral-500 hover:text-neutral-700"><X className="h-3 w-3" /></button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => selectAll()}>Select All</Button>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(filteredIssues)}>Export CSV</Button>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 rounded-[14px] border border-primary-200 dark:border-primary-500/20 bg-primary-50 dark:bg-primary-500/5 p-3 flex flex-wrap items-center gap-3 animate-slide-down">
          <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{selectedIds.size} selected</span>
          <select value={bulkAction} onChange={(e) => { setBulkAction(e.target.value); setBulkValue(''); }} className="h-8 rounded-[10px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-2 text-xs">
            <option value="">Choose action...</option>
            <option value="status">Update Status</option>
            <option value="assign">Assign Department</option>
            <option value="severity">Update Severity</option>
          </select>
          {bulkAction === 'status' && (
            <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} className="h-8 rounded-[10px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-2 text-xs">
              <option value="">Select status...</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          )}
          {bulkAction === 'assign' && (
            <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} className="h-8 rounded-[10px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-2 text-xs">
              <option value="">Select dept...</option>
              <option value="public_works">Public Works</option>
              <option value="water_supply">Water Supply</option>
              <option value="electricity">Electricity</option>
              <option value="sanitation">Sanitation</option>
              <option value="roads">Roads</option>
            </select>
          )}
          {bulkAction === 'severity' && (
            <select value={bulkValue} onChange={(e) => setBulkValue(e.target.value)} className="h-8 rounded-[10px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-800 text-text-primary dark:text-neutral-200 px-2 text-xs">
              <option value="">Select severity...</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}
          <Button
            size="sm"
            disabled={!bulkAction || !bulkValue || bulkState.executing}
            isLoading={bulkState.executing}
            onClick={() => {
              const ids = Array.from(selectedIds);
              if (bulkAction === 'status') bulkUpdateStatus(ids, bulkValue);
              else if (bulkAction === 'assign') bulkAssign(ids, bulkValue);
              else if (bulkAction === 'severity') bulkSeverity(ids, bulkValue);
            }}
          >
            Apply
          </Button>
          {bulkState.executing && (
            <div className="flex-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden ml-2">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${bulkState.progress}%` }} />
            </div>
          )}
          {bulkState.result && (
            <span className="text-xs text-success-600 dark:text-success-400">
              ✓ {bulkState.result.succeeded}/{bulkState.result.total} updated
            </span>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-[14px]" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && issues.length === 0 && (
        <EmptyState
          icon={<ClipboardList className="h-8 w-8" />}
          title="No Issues"
          description="No issues have been reported yet."
          actionLabel="Report an Issue"
          onAction={() => navigate('/app/issues/new')}
        />
      )}

      {/* No filter results */}
      {!loading && issues.length > 0 && filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-3">No issues match your filters</p>
          <Button variant="outline" size="sm" onClick={clearAll}>Clear Filters</Button>
        </div>
      )}

      {/* Table View */}
      {!loading && filteredIssues.length > 0 && viewMode === 'table' && (
        <div className="space-y-2">
          {filteredIssues.map((issue) => (
            <div
              key={issue.documentId}
              className={cn(
                'flex items-center gap-3 rounded-[14px] border p-3 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm',
                selectedIds.has(issue.documentId)
                  ? 'border-primary-300 dark:border-primary-500/40 bg-primary-50/50 dark:bg-primary-500/5'
                  : 'border-border dark:border-neutral-700 hover:bg-surface-hover dark:hover:bg-neutral-800'
              )}
              onClick={() => navigate(`/app/issues/${issue.documentId}`)}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.has(issue.documentId)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(issue.documentId); }}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 shrink-0"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Priority indicator */}
              <div className={cn(
                'w-1 h-10 rounded-full shrink-0',
                issue.priorityLabel === 'Critical' && 'bg-danger-500',
                issue.priorityLabel === 'High' && 'bg-accent-500',
                issue.priorityLabel === 'Medium' && 'bg-primary-400',
                issue.priorityLabel === 'Low' && 'bg-neutral-300',
              )} />

              {/* Thumbnail */}
              <div className="h-10 w-10 shrink-0 rounded-[8px] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {issue.imageDataURL ? (
                  <img src={issue.imageDataURL} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><MapPin className="h-3.5 w-3.5 text-neutral-400" /></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary dark:text-white truncate">{issue.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono text-neutral-400">{issue.trackingId}</span>
                  <span className="text-neutral-300 dark:text-neutral-600">·</span>
                  <span className="text-[10px] text-neutral-400">{issue.reporterName}</span>
                  <span className="text-neutral-300 dark:text-neutral-600">·</span>
                  <span className="text-[10px] text-neutral-400">{formatRelativeTime(issue.createdAt)}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={getPriorityVariant(issue.priorityLabel)} size="sm">
                  P{issue.priorityScore}
                </Badge>
                <Badge variant={getStatusVariant(issue.status)} size="sm">
                  {formatStatus(issue.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Kanban View */}
      {!loading && filteredIssues.length > 0 && viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {['pending', 'in_progress', 'resolved', 'closed'].map((status) => {
            const statusIssues = filteredIssues.filter((i) => i.status === status || (status === 'pending' && i.status === 'validated'));
            return (
              <div key={status} className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                    {formatStatus(status)}
                  </h3>
                  <Badge variant="neutral" size="sm">{statusIssues.length}</Badge>
                </div>
                {statusIssues.map((issue) => (
                  <Card
                    key={issue.documentId}
                    hoverable
                    className="!p-3 cursor-pointer"
                    onClick={() => navigate(`/app/issues/${issue.documentId}`)}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        'w-1 h-8 rounded-full shrink-0 mt-0.5',
                        issue.priorityLabel === 'Critical' && 'bg-danger-500',
                        issue.priorityLabel === 'High' && 'bg-accent-500',
                        issue.priorityLabel === 'Medium' && 'bg-primary-400',
                        issue.priorityLabel === 'Low' && 'bg-neutral-300',
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-text-primary dark:text-white truncate">{issue.title}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5 capitalize">{issue.category.replace('_', ' ')}</p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <Badge variant={getPriorityVariant(issue.priorityLabel)} size="sm">
                            {issue.severity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {statusIssues.length === 0 && (
                  <p className="text-[11px] text-neutral-400 text-center py-4">No issues</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

// ─── Helpers ───

function getStatusVariant(status: string): 'success' | 'accent' | 'primary' | 'neutral' {
  switch (status) {
    case 'resolved': case 'closed': return 'success';
    case 'pending': case 'validated': return 'accent';
    case 'in_progress': return 'primary';
    default: return 'neutral';
  }
}

function getPriorityVariant(label: string): 'danger' | 'accent' | 'primary' | 'neutral' {
  switch (label) {
    case 'Critical': return 'danger';
    case 'High': return 'accent';
    case 'Medium': return 'primary';
    default: return 'neutral';
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
