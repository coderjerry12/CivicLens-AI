import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/features/auth';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

interface NavbarProps {
  onMenuToggle: () => void;
  className?: string;
}

export function Navbar({ onMenuToggle, className }: NavbarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useRealtimeNotifications();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 dark:bg-neutral-900/80 dark:border-white/10 backdrop-blur-md px-4 lg:px-6',
        className
      )}
    >
      {/* Left: Mobile menu + Search */}
      <div className="flex items-center gap-3">
        <Button
          variant="icon"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div
          className={cn(
            'hidden sm:flex items-center gap-2 rounded-[14px] border px-3 py-2 transition-all duration-200',
            searchFocused
              ? 'border-primary-500 ring-2 ring-primary-100 w-80'
              : 'border-border w-64'
          )}
        >
          <Search className="h-4 w-4 text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search issues, locations..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right: Theme + Notifications + Profile */}
      <div className="flex items-center gap-2">
        <ThemeToggle compact />

        <Button
          variant="icon"
          size="icon"
          aria-label="Notifications"
          onClick={() => navigate('/app/notifications')}
        >
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </Button>

        <button
          className="ml-2 flex items-center gap-2 rounded-[14px] p-1.5 hover:bg-neutral-100 transition-colors duration-200"
          aria-label="User menu"
          onClick={() => navigate('/app/settings')}
        >
          <Avatar
            fallback={user?.displayName || 'U'}
            size="sm"
            src={user?.photoURL || undefined}
          />
        </button>
      </div>
    </header>
  );
}
