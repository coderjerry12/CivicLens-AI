import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';

interface AppLoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Global loading overlay. Use for:
 * - Initial app load
 * - Full-page transitions
 * - Auth state resolution
 *
 * For inline/partial loading, use <Spinner /> instead.
 */
export function AppLoadingOverlay({
  message = 'Loading...',
  fullScreen = true,
  className,
}: AppLoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 bg-background',
        fullScreen && 'fixed inset-0 z-[200]',
        !fullScreen && 'py-20',
        className
      )}
      role="status"
      aria-label={message}
    >
      {/* Animated logo */}
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-primary-600 animate-pulse">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-[14px] bg-primary-400/20 animate-ping" />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold text-text-primary">{APP_NAME}</p>
        <p className="text-xs text-text-muted mt-1">{message}</p>
      </div>

      {/* Loading bar */}
      <div className="w-48 h-1 rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-primary-500 animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
