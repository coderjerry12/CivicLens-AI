import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary-100 text-primary-700 border border-primary-200',
        secondary: 'bg-secondary-100 text-secondary-700 border border-secondary-200',
        accent: 'bg-accent-100 text-accent-700 border border-accent-200',
        success: 'bg-success-100 text-success-700 border border-success-200',
        danger: 'bg-danger-100 text-danger-700 border border-danger-200',
        neutral: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
      },
      size: {
        sm: 'text-xs px-2 py-0.5 rounded-md',
        md: 'text-xs px-2.5 py-1 rounded-lg',
        lg: 'text-sm px-3 py-1 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
