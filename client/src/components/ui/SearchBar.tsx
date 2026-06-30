import { useState, type ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-[14px] border px-3 py-2.5 transition-all duration-200',
        focused
          ? 'border-primary-500 ring-2 ring-primary-100'
          : 'border-border hover:border-border-hover',
        className
      )}
    >
      <Search className="h-4 w-4 text-text-muted shrink-0" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={handleClear}
          className="shrink-0 rounded-md p-0.5 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
