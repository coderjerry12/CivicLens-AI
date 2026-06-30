import { useState, useCallback, useRef } from 'react';
import { processImage, type UploadProgress } from '@/lib/storageService';

/**
 * Hook for processing and compressing images for storage.
 * Converts images to base64 data URLs that can be stored in Firestore.
 *
 * Usage:
 * const { uploadState, startUpload, retry, cancel, reset } = useImageUpload();
 * startUpload(file);
 * // On success: uploadState.dataURL contains the base64 string
 */
export function useImageUpload() {
  const [uploadState, setUploadState] = useState<UploadProgress>({
    state: 'idle',
    progress: 0,
    dataURL: null,
    error: null,
  });

  const cancelRef = useRef<(() => void) | null>(null);
  const lastFileRef = useRef<File | null>(null);

  const startUpload = useCallback((file: File) => {
    // Prevent duplicate processing
    if (uploadState.state === 'uploading') return;

    lastFileRef.current = file;

    setUploadState({
      state: 'uploading',
      progress: 0,
      dataURL: null,
      error: null,
    });

    const { cancel } = processImage({
      file,
      onProgress: (progress) => {
        setUploadState((prev) => ({ ...prev, progress }));
      },
      onSuccess: (dataURL) => {
        setUploadState({
          state: 'success',
          progress: 100,
          dataURL,
          error: null,
        });
        cancelRef.current = null;
      },
      onError: (error) => {
        setUploadState({
          state: 'error',
          progress: 0,
          dataURL: null,
          error,
        });
        cancelRef.current = null;
      },
    });

    cancelRef.current = cancel;
  }, [uploadState.state]);

  const retry = useCallback(() => {
    if (lastFileRef.current) {
      startUpload(lastFileRef.current);
    }
  }, [startUpload]);

  const cancel = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    setUploadState({
      state: 'idle',
      progress: 0,
      dataURL: null,
      error: null,
    });
  }, []);

  const reset = useCallback(() => {
    cancelRef.current?.();
    cancelRef.current = null;
    lastFileRef.current = null;
    setUploadState({
      state: 'idle',
      progress: 0,
      dataURL: null,
      error: null,
    });
  }, []);

  return {
    uploadState,
    startUpload,
    retry,
    cancel,
    reset,
  };
}
