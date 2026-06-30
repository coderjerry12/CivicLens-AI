import { useState, useCallback } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  variant: 'danger' | 'warning' | 'default';
  confirmLabel: string;
}

const defaultState: ConfirmState = {
  open: false,
  title: '',
  description: '',
  variant: 'default',
  confirmLabel: 'Confirm',
};

/**
 * Hook for managing confirm dialog state.
 *
 * Usage:
 * const { confirmState, confirm, handleClose, handleConfirm } = useConfirm();
 *
 * // Trigger:
 * const confirmed = await confirm({
 *   title: 'Delete Issue',
 *   description: 'This cannot be undone.',
 *   variant: 'danger',
 *   confirmLabel: 'Delete',
 * });
 *
 * if (confirmed) { ... }
 */
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>(defaultState);
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: Omit<ConfirmState, 'open'>): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmState({ ...options, open: true });
        setResolveRef(() => resolve);
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setConfirmState(defaultState);
    resolveRef?.(false);
    setResolveRef(null);
  }, [resolveRef]);

  const handleConfirm = useCallback(() => {
    setConfirmState(defaultState);
    resolveRef?.(true);
    setResolveRef(null);
  }, [resolveRef]);

  return { confirmState, confirm, handleClose, handleConfirm };
}
