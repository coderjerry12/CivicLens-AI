import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-[14px] bg-neutral-200',
        className
      )}
      aria-hidden="true"
    />
  );
}
