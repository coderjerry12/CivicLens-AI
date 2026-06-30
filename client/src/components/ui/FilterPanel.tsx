import { type ReactNode } from 'react';
import { Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Badge } from './Badge';

interface FilterPanelProps {
  children: ReactNode;
  activeCount?: number;
  onClear?: () => void;
  className?: string;
}

export function FilterPanel({
  children,
  activeCount = 0,
  onClear,
  className,
}: FilterPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-[14px] border border-border bg-surface p-3',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <Badge variant="primary" size="sm">
            {activeCount}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">{children}</div>

      {activeCount > 0 && onClear && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
          <X className="h-3.5 w-3.5" />
          Clear all
        </Button>
      )}
    </div>
  );
}

// ─── Filter Chip (used inside FilterPanel) ───

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick: () => void;
}

export function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-all duration-200',
        active
          ? 'border-primary-300 bg-primary-50 text-primary-700'
          : 'border-border bg-surface text-text-secondary hover:border-border-hover hover:bg-surface-hover'
      )}
    >
      {label}
      {active && <X className="h-3 w-3" />}
    </button>
  );
}
