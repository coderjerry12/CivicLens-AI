import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  if (compact) {
    // Simple icon button toggle (light ↔ dark)
    return (
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-[10px] text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors',
          className
        )}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  }

  // Full segmented toggle (Light / Dark / System)
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[12px] border border-border dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 p-1',
        className
      )}
    >
      <ToggleButton
        active={theme === 'light'}
        onClick={() => setTheme('light')}
        label="Light"
        icon={<Sun className="h-3.5 w-3.5" />}
      />
      <ToggleButton
        active={theme === 'dark'}
        onClick={() => setTheme('dark')}
        label="Dark"
        icon={<Moon className="h-3.5 w-3.5" />}
      />
      <ToggleButton
        active={theme === 'system'}
        onClick={() => setTheme('system')}
        label="System"
        icon={<Monitor className="h-3.5 w-3.5" />}
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-medium transition-all duration-200',
        active
          ? 'bg-surface dark:bg-neutral-700 text-text-primary dark:text-white shadow-sm'
          : 'text-text-muted dark:text-neutral-400 hover:text-text-secondary'
      )}
      aria-label={`${label} theme`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
