import { Suspense, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Brain,
  MapPin,
  Clock,
  Shield,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Link2,
  UserCircle,
} from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Button, Spinner, Input, TextArea, Select } from '@/components/ui';
import { LocationPicker } from '@/components/location';
import { useIssueWorkspace } from '@/hooks/useIssueWorkspace';
import { useWorkflow } from '@/hooks/useWorkflow';
import { useAuth } from '@/features/auth';
import { calculateSLA } from '@/services/slaService';
import { formatRelativeTime } from '@/lib/utils';
import { STATUS_TRANSITIONS, STATUS_LABELS, type IssueWorkflowStatus } from '@/types/workflow';
import { DEPARTMENT_OPTIONS } from '@/types/issueQueue';

export default function IssueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, refresh } = useIssueWorkspace(id);
  const { user } = useAuth();
  const isAuthority = user?.role === 'authority';

  if (loading) {
    return <div className="flex h-full items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-neutral-400 mb-4" />
        <p className="text-sm text-text-secondary">{error || 'Issue not found.'}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const { issue, similarIssues } = data;

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">{issue.trackingId}</span>
              <StatusBadge status={issue.status} />
              <RiskBadge risk={issue.riskLevel} />
              <Badge variant="neutral" size="sm">P{issue.priorityScore}</Badge>
            </div>
            <h1 className="text-xl font-bold text-text-primary dark:text-white">{issue.title}</h1>
          </div>
          <p className="text-xs text-neutral-500">{formatRelativeTime(issue.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <Card>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary-600 dark:text-primary-400" /> Photo Evidence</CardTitle>
            <CardContent className="mt-4">
              {issue.imageDataURL ? (
                <img src={issue.imageDataURL} alt={issue.title} className="w-full h-64 sm:h-80 object-cover rounded-[14px]" />
              ) : (
                <div className="h-48 rounded-[14px] bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-neutral-400" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-secondary-600 dark:text-secondary-400" /> AI Analysis</CardTitle>
            <CardContent className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <MetaBox label="Category" value={issue.category.replace('_', ' ')} />
                <MetaBox label="Severity" value={issue.severity} />
                <MetaBox label="Department" value={issue.department.replace('_', ' ')} />
                <MetaBox label="Confidence" value={`${issue.aiMetadata.confidence}%`} />
                <MetaBox label="Risk Level" value={issue.riskLevel} />
                <MetaBox label="Model" value={issue.aiMetadata.model} />
              </div>
              <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Description</p>
                <p className="text-sm text-text-primary dark:text-neutral-200 leading-relaxed">{issue.description}</p>
              </div>
              {issue.aiMetadata.wasEdited && (
                <p className="text-[10px] text-accent-600 dark:text-accent-400 mt-2">✎ Fields were edited by reporter after AI analysis</p>
              )}
            </CardContent>
          </Card>

          {/* Authority Action Panel */}
          {isAuthority && (
            <AuthorityActionPanel issueId={issue.documentId} currentStatus={issue.status as IssueWorkflowStatus} onAction={refresh} />
          )}

          {/* SLA Indicators */}
          <SLACard createdAt={issue.createdAt} status={issue.status} />

          {/* Map */}
          <Card>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-danger-600 dark:text-danger-400" /> Location</CardTitle>
            <CardContent className="mt-4">
              <Suspense fallback={<div className="h-48 rounded-[14px] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />}>
                <LocationPicker value={{ latitude: issue.location.latitude, longitude: issue.location.longitude, address: issue.location.address, source: issue.location.source as 'gps' | 'search' | 'manual' }} onChange={() => {}} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" /> Timeline</CardTitle>
            <CardContent className="mt-4">
              <div className="space-y-4">
                {issue.timeline.map((entry, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/20">
                        <CheckCircle2 className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                      </div>
                      {idx < issue.timeline.length - 1 && <div className="w-px flex-1 bg-neutral-200 dark:bg-neutral-700 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium text-text-primary dark:text-neutral-200">{entry.action}</p>
                      <p className="text-[10px] text-neutral-400">{entry.by} • {entry.at ? formatRelativeTime(new Date(entry.at)) : ''}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <div className="flex items-center"><div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800"><Loader2 className="h-3 w-3 text-neutral-400 animate-spin" /></div></div>
                  <p className="text-xs text-neutral-400">Awaiting next action</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reporter */}
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><UserCircle className="h-4 w-4 text-neutral-500" /> Reporter</CardTitle>
            <CardContent className="mt-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/20 text-sm font-semibold text-primary-700 dark:text-primary-400">
                  {issue.reporter.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary dark:text-white">{issue.reporter.name}</p>
                  <p className="text-xs text-neutral-500">{issue.reporter.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Issues */}
          <Card>
            <CardTitle className="flex items-center gap-2 text-sm"><Link2 className="h-4 w-4 text-secondary-500" /> Related Issues</CardTitle>
            <CardContent className="mt-3">
              {similarIssues.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No similar issues found nearby.</p>
              ) : (
                <div className="space-y-2">
                  {similarIssues.map((si) => (
                    <div
                      key={si.documentId}
                      className="flex items-center justify-between rounded-[10px] bg-neutral-50 dark:bg-neutral-800 px-3 py-2 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={() => navigate(`/app/issues/${si.documentId}`)}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200 truncate">{si.title}</p>
                        <p className="text-[10px] text-neutral-400">{si.distance}km away • {si.similarityScore}% match</p>
                      </div>
                      <Badge variant={si.status === 'resolved' ? 'success' : 'accent'} size="sm">
                        {si.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community */}
          <Card className="border-dashed border-neutral-300 dark:border-neutral-700">
            <CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-neutral-400" /> Community</CardTitle>
            <CardContent className="mt-3">
              <p className="text-xs text-neutral-400 text-center py-4">{issue.validations} validation{issue.validations !== 1 ? 's' : ''} from community</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'accent' | 'primary' | 'success' | 'neutral' }> = {
    pending: { label: 'Pending', variant: 'accent' },
    validated: { label: 'Validated', variant: 'primary' },
    in_progress: { label: 'In Progress', variant: 'primary' },
    resolved: { label: 'Resolved', variant: 'success' },
    closed: { label: 'Closed', variant: 'neutral' },
  };
  const c = map[status] || map.pending;
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
}

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, { variant: 'danger' | 'accent' | 'primary' | 'neutral' }> = {
    critical: { variant: 'danger' },
    high: { variant: 'accent' },
    moderate: { variant: 'primary' },
    low: { variant: 'neutral' },
  };
  const v = map[risk] || map.low;
  return <Badge variant={v.variant} size="sm">Risk: {risk}</Badge>;
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-3 text-center">
      <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-1 capitalize">{value}</p>
    </div>
  );
}

// ─── Authority Action Panel ───

function AuthorityActionPanel({ issueId, currentStatus, onAction }: { issueId: string; currentStatus: IssueWorkflowStatus; onAction: () => void }) {
  const workflow = useWorkflow(issueId, onAction);
  const [noteText, setNoteText] = useState('');
  const [assignDept, setAssignDept] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [showAssign, setShowAssign] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  return (
    <Card className="border-primary-200 dark:border-primary-500/20">
      <CardTitle className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        Authority Actions
      </CardTitle>
      <CardContent className="mt-4 space-y-3">
        {/* Status messages */}
        {workflow.success && (
          <div className="rounded-[10px] bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 px-3 py-2">
            <p className="text-xs text-success-700 dark:text-success-300">{workflow.success}</p>
          </div>
        )}
        {workflow.error && (
          <div className="rounded-[10px] bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 px-3 py-2">
            <p className="text-xs text-danger-700 dark:text-danger-300">{workflow.error}</p>
          </div>
        )}

        {/* Status transitions */}
        <div className="flex flex-wrap gap-2">
          {allowedTransitions.map((status) => (
            <Button
              key={status}
              variant={status === 'resolved' ? 'primary' : status === 'rejected' ? 'danger' : 'outline'}
              size="sm"
              onClick={() => {
                if (status === 'assigned') { setShowAssign(true); return; }
                if (status === 'resolved') { setShowResolve(true); return; }
                workflow.changeStatus(currentStatus, status);
              }}
              isLoading={workflow.loading}
              disabled={workflow.loading}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={() => setShowNote(!showNote)} disabled={workflow.loading}>
            Add Note
          </Button>
        </div>

        {/* Assignment form */}
        {showAssign && (
          <div className="rounded-[10px] border border-border dark:border-neutral-700 p-3 space-y-2">
            <Select
              label="Department"
              options={DEPARTMENT_OPTIONS}
              value={assignDept}
              onChange={(e) => setAssignDept(e.target.value)}
              placeholder="Select department"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!assignDept || workflow.loading}
              isLoading={workflow.loading}
              onClick={() => {
                workflow.assign({ department: assignDept });
                setShowAssign(false);
                setAssignDept('');
              }}
            >
              Assign
            </Button>
          </div>
        )}

        {/* Resolution form */}
        {showResolve && (
          <div className="rounded-[10px] border border-border dark:border-neutral-700 p-3 space-y-2">
            <TextArea
              label="Resolution Summary"
              placeholder="Describe how the issue was resolved..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!resolutionSummary.trim() || workflow.loading}
              isLoading={workflow.loading}
              onClick={() => {
                workflow.resolve({ summary: resolutionSummary, completedAt: new Date().toISOString() });
                setShowResolve(false);
                setResolutionSummary('');
              }}
            >
              Mark as Resolved
            </Button>
          </div>
        )}

        {/* Note form */}
        {showNote && (
          <div className="rounded-[10px] border border-border dark:border-neutral-700 p-3 space-y-2">
            <Input
              placeholder="Add internal note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!noteText.trim() || workflow.loading}
              isLoading={workflow.loading}
              onClick={() => {
                workflow.addNote(noteText);
                setShowNote(false);
                setNoteText('');
              }}
            >
              Save Note
            </Button>
          </div>
        )}

        <p className="text-[10px] text-neutral-400">Current: {STATUS_LABELS[currentStatus]}</p>
      </CardContent>
    </Card>
  );
}

// ─── SLA Card ───

function SLACard({ createdAt, status }: { createdAt: Date; status: string }) {
  const sla = calculateSLA(createdAt, null, null, status === 'resolved' ? new Date() : null);

  return (
    <Card>
      <CardTitle className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-neutral-500" />
        SLA Tracking
        <Badge
          variant={sla.slaStatus === 'breached' ? 'danger' : sla.slaStatus === 'warning' ? 'accent' : 'success'}
          size="sm"
          className="ml-auto"
        >
          {sla.slaStatus === 'breached' ? 'SLA Breached' : sla.slaStatus === 'warning' ? 'Warning' : 'On Track'}
        </Badge>
      </CardTitle>
      <CardContent className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">Time since reported</span>
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{sla.timeSinceReported}h</span>
        </div>
        {sla.resolutionDuration && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Resolution time</span>
            <span className="text-xs font-medium text-success-600">{sla.resolutionDuration}h</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
