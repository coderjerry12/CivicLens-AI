import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ─── Context ───

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ─── Provider ───

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// ─── Container ───

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ─── Individual Toast ───

const iconMap: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-success-200 bg-success-50',
  error: 'border-danger-200 bg-danger-50',
  warning: 'border-accent-200 bg-accent-50',
  info: 'border-primary-200 bg-primary-50',
};

const iconStyles: Record<ToastVariant, string> = {
  success: 'text-success-600',
  error: 'text-danger-600',
  warning: 'text-accent-600',
  info: 'text-primary-600',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const Icon = iconMap[toast.variant];

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => onRemove(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[14px] border p-4 shadow-lg animate-slide-up',
        variantStyles[toast.variant]
      )}
      role="alert"
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[toast.variant])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-text-secondary">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-md p-1 text-text-muted hover:text-text-primary hover:bg-white/50 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
