import type { SLAMetrics } from '@/types/workflow';

// SLA thresholds in hours
const SLA_WARNING_HOURS = 24;
const SLA_BREACH_HOURS = 48;

/**
 * Calculates SLA metrics from issue timestamps.
 */
export function calculateSLA(
  createdAt: Date,
  assignedAt: Date | null,
  inProgressAt: Date | null,
  resolvedAt: Date | null
): SLAMetrics {
  const now = Date.now();

  const timeSinceReported = (now - createdAt.getTime()) / (1000 * 60 * 60);

  const timeSinceAssigned = assignedAt
    ? (now - assignedAt.getTime()) / (1000 * 60 * 60)
    : null;

  const timeInProgress = inProgressAt
    ? ((resolvedAt?.getTime() || now) - inProgressAt.getTime()) / (1000 * 60 * 60)
    : null;

  const resolutionDuration = resolvedAt
    ? (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    : null;

  let slaStatus: SLAMetrics['slaStatus'] = 'on_track';
  if (timeSinceReported > SLA_BREACH_HOURS && !resolvedAt) {
    slaStatus = 'breached';
  } else if (timeSinceReported > SLA_WARNING_HOURS && !resolvedAt) {
    slaStatus = 'warning';
  }

  return {
    timeSinceReported: Math.round(timeSinceReported * 10) / 10,
    timeSinceAssigned: timeSinceAssigned ? Math.round(timeSinceAssigned * 10) / 10 : null,
    timeInProgress: timeInProgress ? Math.round(timeInProgress * 10) / 10 : null,
    resolutionDuration: resolutionDuration ? Math.round(resolutionDuration * 10) / 10 : null,
    slaStatus,
  };
}
