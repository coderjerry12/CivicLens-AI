import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const initials = fallback
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={alt || fallback}
        className={cn(
          'rounded-full object-cover ring-2 ring-surface',
          sizeMap[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold ring-2 ring-surface',
        sizeMap[size],
        className
      )}
      aria-label={fallback}
    >
      {initials}
    </div>
  );
}
