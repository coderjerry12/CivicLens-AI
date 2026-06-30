import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
  className,
}: DrawerProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          'fixed top-0 z-50 h-full w-[320px] bg-surface shadow-xl transition-transform duration-300 ease-out',
          side === 'right' ? 'right-0' : 'left-0',
          side === 'right'
            ? open
              ? 'translate-x-0'
              : 'translate-x-full'
            : open
              ? 'translate-x-0'
              : '-translate-x-full',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          {title && (
            <h2 id="drawer-title" className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
          )}
          <Button
            variant="icon"
            size="icon"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  );
}
