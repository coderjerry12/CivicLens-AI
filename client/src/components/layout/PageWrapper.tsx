import { cn } from '@/lib/utils';
import { type BaseProps } from '@/types';

interface PageWrapperProps extends BaseProps {
  title?: string;
  description?: string;
}

export function PageWrapper({ title, description, children, className }: PageWrapperProps) {
  return (
    <main className={cn('flex-1 p-4 lg:p-6 animate-fade-in', className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          )}
        </div>
      )}
      {children}
    </main>
  );
}
