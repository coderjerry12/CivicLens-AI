/**
 * Image storage service — converts images to base64 data URLs.
 * Stores directly in Firestore documents (no Firebase Storage needed).
 * Works on the free Spark plan.
 *
 * Limitation: ~750KB max image size after compression (Firestore 1MB doc limit).
 * For production, upgrade to Blaze plan and use Firebase Storage.
 */

// ─── Types ───

export interface UploadProgress {
  state: 'idle' | 'uploading' | 'success' | 'error';
  progress: number; // 0-100
  dataURL: string | null;
  error: string | null;
}

export interface ProcessOptions {
  file: File;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
  onSuccess?: (dataURL: string) => void;
  onError?: (error: string) => void;
}

// ─── Constants ───

const MAX_DIMENSION = 1200; // Resize large images
const JPEG_QUALITY = 0.7; // Compress to keep under Firestore limit
const MAX_DATA_URL_SIZE = 750 * 1024; // 750KB after base64 encoding

// ─── Process & Compress Image ───

export function processImage(options: ProcessOptions): { cancel: () => void } {
  const {
    file,
    maxWidth = MAX_DIMENSION,
    maxHeight = MAX_DIMENSION,
    quality = JPEG_QUALITY,
    onProgress,
    onSuccess,
    onError,
  } = options;

  let cancelled = false;

  const process = async () => {
    try {
      onProgress?.(10);

      // Read file as data URL
      const rawDataURL = await readFileAsDataURL(file);
      if (cancelled) return;
      onProgress?.(30);

      // Load image to get dimensions
      const img = await loadImage(rawDataURL);
      if (cancelled) return;
      onProgress?.(50);

      // Compress and resize
      const compressedDataURL = compressImage(img, maxWidth, maxHeight, quality);
      if (cancelled) return;
      onProgress?.(80);

      // Check size
      if (compressedDataURL.length > MAX_DATA_URL_SIZE) {
        // Try harder compression
        const smallerDataURL = compressImage(img, 800, 800, 0.5);
        if (smallerDataURL.length > MAX_DATA_URL_SIZE) {
          onError?.('Image is too large even after compression. Please use a smaller image.');
          return;
        }
        onProgress?.(100);
        onSuccess?.(smallerDataURL);
        return;
      }

      onProgress?.(100);
      onSuccess?.(compressedDataURL);
    } catch {
      if (!cancelled) {
        onError?.('Failed to process image. Please try a different file.');
      }
    }
  };

  process();

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}

// ─── Utilities ───

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function compressImage(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  quality: number
): string {
  const canvas = document.createElement('canvas');
  let { width, height } = img;

  // Scale down if needed
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(img, 0, 0, width, height);

  // Output as JPEG for best compression
  return canvas.toDataURL('image/jpeg', quality);
}
