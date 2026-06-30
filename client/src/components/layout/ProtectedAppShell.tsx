import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { AppLoadingOverlay } from '@/components/shared';
import { AppShell } from './AppShell';

/**
 * Auth gate for the main app.
 * Flow:
 *   Not logged in → /auth/login
 *   Email not verified → /auth/verify-email
 *   Profile incomplete → /onboarding/profile
 *   All good → render dashboard shell
 */
export function ProtectedAppShell() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoadingOverlay message="Loading..." />;
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/auth/verify-email" replace />;
  }

  if (!user.profileCompleted) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  return <AppShell />;
}
