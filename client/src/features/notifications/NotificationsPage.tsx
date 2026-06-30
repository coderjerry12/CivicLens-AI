import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, AlertTriangle, MessageSquare, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { Badge, Button, Skeleton } from '@/components/ui';
import { EmptyState } from '@/components/shared';
import { PageWrapper } from '@/components/layout';
import { useNotifications } from '@/hooks/useNotifications';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { NotificationType } from '@/types/community';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  issue_assigned: { icon: ArrowRight, color: 'text-primary-500 bg-primary-50 dark:bg-primary-500/20' },
  status_updated: { icon: AlertTriangle, color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/20' },
  authority_comment: { icon: MessageSquare, color: 'text-secondary-500 bg-secondary-50 dark:bg-secondary-500/20' },
  resolution: { icon: CheckCircle2, color: 'text-success-500 bg-success-50 dark:bg-success-500/20' },
  community_verification: { icon: Users, color: 'text-primary-500 bg-primary-50 dark:bg-primary-500/20' },
  new_comment: { icon: MessageSquare, color: 'text-accent-500 bg-accent-50 dark:bg-accent-500/20' },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  return (
    <PageWrapper title="Notifications" description="Stay updated on your community issues.">
      {/* Header Actions */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <Badge variant="primary" size="md">{unreadCount} unread</Badge>
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-[14px]" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title="No Notifications"
          description="You'll receive updates when your reported issues have activity."
        />
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.status_updated;
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  markRead(notif.id);
                  if (notif.issueId) navigate(`/app/issues/${notif.issueId}`);
                }}
                className={cn(
                  'flex items-start gap-3 rounded-[14px] border p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5',
                  notif.read
                    ? 'border-border dark:border-neutral-700 bg-surface dark:bg-neutral-900'
                    : 'border-primary-200 dark:border-primary-500/20 bg-primary-50/50 dark:bg-primary-500/5'
                )}
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', notif.read ? 'text-neutral-700 dark:text-neutral-300' : 'font-semibold text-neutral-900 dark:text-white')}>
                    {notif.title}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 truncate">{notif.message}</p>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-500 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                </div>
                {!notif.read && <div className="h-2 w-2 rounded-full bg-primary-500 shrink-0 mt-2" />}
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
