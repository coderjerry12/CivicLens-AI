import { lazy, Suspense } from 'react';
import { useAuth } from '@/features/auth';
import { Spinner } from '@/components/ui';

const CitizenDashboard = lazy(() => import('./DashboardPage'));
const AuthorityDashboard = lazy(() => import('@/features/authority/AuthorityDashboardPage'));

/**
 * Renders the correct dashboard based on user role.
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  const Dashboard = user?.role === 'authority' ? AuthorityDashboard : CitizenDashboard;

  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center py-20"><Spinner size="lg" /></div>}>
      <Dashboard />
    </Suspense>
  );
}
