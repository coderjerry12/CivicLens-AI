import type { QueueIssue } from '@/types/issueQueue';

/**
 * Generates and downloads a CSV file from issue data.
 */
export function exportIssuesToCSV(issues: QueueIssue[], filename?: string): void {
  const headers = [
    'Tracking ID',
    'Title',
    'Category',
    'Status',
    'Severity',
    'Priority Score',
    'Department',
    'Reporter',
    'Address',
    'Created Date',
  ];

  const rows = issues.map((issue) => [
    issue.trackingId,
    escapeCSV(issue.title),
    issue.category.replace('_', ' '),
    issue.status.replace('_', ' '),
    issue.severity,
    String(issue.priorityScore),
    issue.department.replace('_', ' '),
    escapeCSV(issue.reporterName),
    escapeCSV(issue.address),
    issue.createdAt.toLocaleDateString(),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `civiclens-issues-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
