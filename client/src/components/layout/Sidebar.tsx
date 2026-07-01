import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Map,
  Bell,
  BarChart3,
  Settings,
  ChevronLeft,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/features/auth';
import { Avatar } from '@/components/ui/Avatar';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Map,
  Bell,
  BarChart3,
  Settings,
};

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const citizenNav: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
  { label: 'Report Issue', path: '/app/issues/new', icon: 'PlusCircle' },
  { label: 'My Issues', path: '/app/issues', icon: 'ClipboardList' },
  { label: 'Community', path: '/app/community', icon: 'Map' },
  { label: 'Map', path: '/app/map', icon: 'Map' },
  { label: 'Notifications', path: '/app/notifications', icon: 'Bell' },
];

const authorityNav: NavItem[] = [
  { label: 'Dashboard', path: '/app/dashboard', icon: 'LayoutDashboard' },
  { label: 'All Issues', path: '/app/issues', icon: 'ClipboardList' },
  { label: 'Map', path: '/app/map', icon: 'Map' },
  { label: 'Analytics', path: '/app/analytics', icon: 'BarChart3' },
  { label: 'Notifications', path: '/app/notifications', icon: 'Bell' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'authority' ? authorityNav : citizenNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-white dark:bg-[#141824] border-neutral-200 dark:border-[#1e2433] transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-600">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-neutral-900 dark:text-white whitespace-nowrap">
            {APP_NAME}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-3 space-y-1">
        {/* User info */}
        {user && !collapsed && (
          <div className="flex items-center gap-3 rounded-[14px] px-3 py-2 mb-2">
            <Avatar fallback={user.displayName || 'U'} size="sm" src={user.photoURL || undefined} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">{user.displayName}</p>
              <p className="text-xs text-text-muted capitalize">{user.role}</p>
            </div>
          </div>
        )}

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            )
          }
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-danger-50 hover:text-danger-700 transition-all duration-200"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={onToggle}
          className="flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-all duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 shrink-0 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
