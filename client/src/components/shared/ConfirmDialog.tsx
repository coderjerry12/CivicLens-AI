import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  icon?: ReactNode;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  isLoading = false,
}: ConfirmDialogProps) {
  const iconElement = icon || (
    variant === 'danger' || variant === 'warning' ? (
      <AlertTriangle className="h-6 w-6" />
    ) : null
  );

  const iconBg =
    variant === 'danger'
      ? 'bg-danger-50 text-danger-600'
      : variant === 'warning'
        ? 'bg-accent-50 text-accent-600'
        : 'bg-primary-50 text-primary-600';

  const confirmVariant = variant === 'danger' ? 'danger' : 'primary';

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        {iconElement && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} mb-4`}>
            {iconElement}
          </div>
        )}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <p className="mt-2 text-sm text-text-secondary max-w-xs">{description}</p>
        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
