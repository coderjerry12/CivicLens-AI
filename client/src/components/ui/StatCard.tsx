import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  iconColor = 'text-primary-600 bg-primary-50',
  className,
}: StatCardProps) {
  return (
    <Card hoverable className={cn('', className)}>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary dark:text-neutral-400">{label}</p>
            <p className="text-2xl font-bold text-text-primary dark:text-white mt-1">{value}</p>
            {trend && (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  trend.isPositive ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-[14px]',
              iconColor
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
