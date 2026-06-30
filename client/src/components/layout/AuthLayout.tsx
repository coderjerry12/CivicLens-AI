import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/features/auth';
import { Spinner } from '@/components/ui';

/**
 * Layout for auth pages. Redirects already-authenticated users
 * to the appropriate place in the app.
 */
export function AuthLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // If user is logged in, redirect them based on their state
  // Exception: allow verify-email page to render even when logged in
  if (user && location.pathname !== '/auth/verify-email') {
    if (!user.emailVerified) {
      return <Navigate to="/auth/verify-email" replace />;
    }
    if (!user.profileCompleted) {
      return <Navigate to="/onboarding/profile" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary-600 mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">{APP_NAME}</h1>
          <p className="text-sm text-text-secondary mt-1">
            AI-powered community issue reporting
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
