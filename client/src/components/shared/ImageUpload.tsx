import { useState, useRef, useCallback, useEffect } from 'react';
import { ImagePlus, Upload, X, Replace, FileImage, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ─── Types ───

export interface UploadedImage {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
}

interface ImageUploadProps {
  value: UploadedImage | null;
  onChange: (image: UploadedImage | null) => void;
  className?: string;
}

// ─── Constants ───

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ───

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (value?.preview) {
        URL.revokeObjectURL(value.preview);
      }
    };
  }, [value?.preview]);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (PNG, JPG, or WEBP).';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large. Maximum size is 10MB (yours is ${formatFileSize(file.size)}).`;
    }
    return null;
  };

  const processFile = useCallback((file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Simulate brief loading for premium feel
    setIsLoading(true);
    setTimeout(() => {
      const preview = URL.createObjectURL(file);
      onChange({
        file,
        preview,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      setIsLoading(false);
    }, 600);
  }, [onChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;

    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    if (value?.preview) {
      URL.revokeObjectURL(value.preview);
    }
    onChange(null);
    setError(null);
  };

  const handleReplace = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className={cn('rounded-[16px] border-2 border-primary-300 dark:border-primary-500/40 bg-primary-50/50 dark:bg-primary-500/5 px-6 py-14', className)}>
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-full border-4 border-primary-200 dark:border-primary-700 border-t-primary-600 dark:border-t-primary-400 animate-spin" />
          </div>
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">Processing image...</p>
          <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">Preparing for AI analysis</p>
        </div>
      </div>
    );
  }

  // ─── Preview State ───
  if (value) {
    return (
      <div className={cn('rounded-[16px] border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 overflow-hidden', className)}>
        {/* Image Preview */}
        <div className="relative group">
          <img
            src={value.preview}
            alt="Uploaded issue"
            className="w-full h-56 sm:h-64 object-cover animate-fade-in"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>

        {/* File info + actions */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary-100 dark:bg-primary-500/20">
              <FileImage className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary dark:text-white truncate">
                {value.name}
              </p>
              <p className="text-xs text-text-muted dark:text-neutral-400">
                {formatFileSize(value.size)} • {value.type.split('/')[1].toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplace}
              aria-label="Replace image"
            >
              <Replace className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Replace</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              aria-label="Remove image"
              className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-500/10"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </Button>
          </div>
        </div>

        {/* Hidden input for replace */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileSelect}
          aria-hidden="true"
        />
      </div>
    );
  }

  // ─── Empty / Drag-Over State ───
  return (
    <div className={cn('', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-[16px] border-2 border-dashed px-6 py-14 transition-all duration-300 cursor-pointer outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          isDragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 scale-[1.01] shadow-lg shadow-primary-500/10'
            : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50/80 dark:bg-neutral-800/30 hover:border-primary-400 hover:bg-primary-50/50 dark:hover:border-primary-500/50 dark:hover:bg-primary-500/5'
        )}
        aria-label="Upload image. Drag and drop or click to browse."
      >
        {/* Icon */}
        <div className="relative mb-5">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300',
              isDragOver
                ? 'bg-primary-200 dark:bg-primary-500/30 scale-110'
                : 'bg-primary-100 dark:bg-primary-500/20 group-hover:scale-110'
            )}
          >
            {isDragOver ? (
              <Upload className="h-9 w-9 text-primary-600 dark:text-primary-400 animate-bounce" />
            ) : (
              <ImagePlus className="h-9 w-9 text-primary-600 dark:text-primary-400" />
            )}
          </div>
          {/* Decorative pulse ring */}
          {isDragOver && (
            <div className="absolute inset-0 rounded-full border-2 border-primary-400 dark:border-primary-500 animate-ping opacity-30" />
          )}
        </div>

        {/* Text */}
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {isDragOver ? 'Drop your image here' : 'Upload an Issue Image'}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
          {isDragOver ? 'Release to upload' : 'Drag & drop or browse your device'}
        </p>

        {!isDragOver && (
          <>
            <Button variant="outline" size="sm" tabIndex={-1} aria-hidden="true">
              <Upload className="h-4 w-4" />
              Browse Files
            </Button>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] text-neutral-400">
              <span className="inline-flex items-center rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 px-2.5 py-1">PNG</span>
              <span className="inline-flex items-center rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 px-2.5 py-1">JPG</span>
              <span className="inline-flex items-center rounded-full bg-neutral-200/60 dark:bg-neutral-700/60 px-2.5 py-1">WEBP</span>
              <span className="text-neutral-400">•</span>
              <span>Max 10MB</span>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 px-3 py-2.5" role="alert">
          <AlertCircle className="h-4 w-4 text-danger-600 dark:text-danger-400 shrink-0 mt-0.5" />
          <p className="text-xs text-danger-700 dark:text-danger-300">{error}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleFileSelect}
        aria-hidden="true"
      />
    </div>
  );
}
