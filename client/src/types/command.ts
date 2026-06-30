/**
 * Types for the command palette.
 */

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category: 'navigation' | 'action' | 'issue' | 'search';
  action: () => void;
  keywords?: string[];
}
