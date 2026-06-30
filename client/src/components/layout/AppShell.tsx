import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { CommandPalette } from '@/components/shared';
import { FloatingAssistant } from '@/components/shared/FloatingAssistant';

/**
 * Main application shell with sidebar + navbar layout.
 * Used for authenticated pages (dashboard, issues, etc.).
 */
export function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CommandPalette />
      <FloatingAssistant />
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: drawer */}
      <div
        className={cn(
          'transition-all duration-300',
          isMobile
            ? cn(
                'fixed z-50 transform',
                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
              )
            : ''
        )}
      >
        <Sidebar
          collapsed={isMobile ? false : sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
          !isMobile && (sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]')
        )}
      >
        <Navbar onMenuToggle={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
