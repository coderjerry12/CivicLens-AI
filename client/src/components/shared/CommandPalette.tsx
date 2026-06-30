import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { Command } from '@/types/command';

export function CommandPalette() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'nav-dashboard', label: 'Dashboard', description: 'Go to dashboard', category: 'navigation', keywords: ['home', 'overview'], action: () => navigate('/app/dashboard') },
    { id: 'nav-report', label: 'Report Issue', description: 'Create a new report', category: 'action', keywords: ['new', 'create', 'submit'], action: () => navigate('/app/issues/new') },
    { id: 'nav-issues', label: 'All Issues', description: 'View issue queue', category: 'navigation', keywords: ['list', 'queue', 'manage'], action: () => navigate('/app/issues') },
    { id: 'nav-map', label: 'Map View', description: 'GIS operations center', category: 'navigation', keywords: ['location', 'gis', 'markers'], action: () => navigate('/app/map') },
    { id: 'nav-analytics', label: 'Analytics', description: 'View insights', category: 'navigation', keywords: ['stats', 'charts', 'metrics'], action: () => navigate('/app/analytics') },
    { id: 'nav-profile', label: 'Profile', description: 'View your profile', category: 'navigation', keywords: ['account', 'badges', 'achievements'], action: () => navigate('/app/profile') },
    { id: 'nav-settings', label: 'Settings', description: 'App settings', category: 'navigation', keywords: ['preferences', 'config'], action: () => navigate('/app/settings') },
  ];

  const { open, query, setQuery, toggle, close, filteredCommands, execute } = useCommandPalette(commands);

  useKeyboardShortcuts([
    { key: 'k', ctrl: true, action: toggle },
    { key: 'Escape', action: close },
  ]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-label="Command palette">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={close} />

      {/* Panel */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg animate-scale-in">
        <div className="rounded-[20px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
            <Search className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, pages, issues..."
              className="flex-1 bg-transparent text-sm text-text-primary dark:text-white placeholder:text-neutral-400 focus:outline-none"
            />
            <kbd className="hidden sm:inline-flex text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">No results found</p>
            ) : (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => execute(cmd)}
                  className="w-full flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <CommandIcon category={cmd.category} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{cmd.label}</p>
                    {cmd.description && (
                      <p className="text-[11px] text-neutral-400 truncate">{cmd.description}</p>
                    )}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-neutral-300 dark:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 px-4 py-2 flex items-center justify-between">
            <p className="text-[10px] text-neutral-400">
              <kbd className="font-medium">↑↓</kbd> Navigate <kbd className="font-medium ml-2">↵</kbd> Select
            </p>
            <p className="text-[10px] text-neutral-400">
              <kbd className="font-medium">⌘K</kbd> Toggle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommandIcon({ category }: { category: string }) {
  switch (category) {
    case 'navigation': return <LayoutDashboard className="h-4 w-4" />;
    case 'action': return <PlusCircle className="h-4 w-4" />;
    default: return <Search className="h-4 w-4" />;
  }
}
