import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md',
        secondary:
          'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-sm hover:shadow-md',
        outline:
          'border-2 border-primary-300 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
        ghost:
          'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
        danger:
          'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 shadow-sm',
        icon: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200',
      },
      size: {
        sm: 'h-8 px-3 text-sm rounded-[10px]',
        md: 'h-10 px-4 text-sm rounded-[14px]',
        lg: 'h-12 px-6 text-base rounded-[14px]',
        icon: 'h-10 w-10 rounded-[14px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
