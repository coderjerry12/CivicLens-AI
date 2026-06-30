import { RouterProvider } from 'react-router-dom';
import { ToastProvider } from '@/components/ui';
import { ErrorBoundary, OfflineBanner } from '@/components/shared';
import { AuthProvider } from '@/features/auth';
import { router } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
