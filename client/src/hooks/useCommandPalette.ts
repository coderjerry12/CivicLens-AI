import { useState, useCallback, useMemo } from 'react';
import type { Command } from '@/types/command';

/**
 * Hook for managing the command palette state and search.
 */
export function useCommandPalette(commands: Command[]) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
    setQuery('');
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((cmd) => {
      const searchable = [cmd.label, cmd.description, ...(cmd.keywords || [])].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [commands, query]);

  const execute = useCallback((command: Command) => {
    command.action();
    close();
  }, [close]);

  return { open, query, setQuery, toggle, close, filteredCommands, execute };
}
