import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AppLoadingOverlay } from '@/components/shared';
import { type UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Route guard that handles:
 * 1. Authentication check → redirect to login
 * 2. Email verification check → redirect to verify-email
 * 3. Profile completion check → redirect to onboarding
 * 4. Role authorization check → redirect to unauthorized
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoadingOverlay message="Checking authentication..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Email not verified
  if (!user.emailVerified) {
    return <Navigate to="/auth/verify-email" replace />;
  }

  // Profile not completed
  if (!user.profileCompleted) {
    return <Navigate to="/onboarding/profile" replace />;
  }

  // Role check
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
