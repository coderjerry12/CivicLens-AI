import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ─── Base Card ───

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, glass, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[20px] border border-border dark:border-neutral-700 bg-surface dark:bg-neutral-900 p-6 shadow-sm text-text-primary dark:text-neutral-100',
          hoverable && 'transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
          glass && 'glass',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

// ─── Card Header ───

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

// ─── Card Title ───

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-text-primary dark:text-white', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

// ─── Card Description ───

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary dark:text-neutral-400 mt-1', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

// ─── Card Content ───

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// ─── Card Footer ───

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 flex items-center gap-2', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
