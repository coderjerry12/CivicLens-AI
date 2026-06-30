import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout';
import { ProtectedAppShell } from '@/components/layout';
import { Spinner } from '@/components/ui';
import { RouterErrorBoundary } from './RouterErrorBoundary';

// ─── Lazy-loaded pages ───

// Auth
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('@/features/auth/VerifyEmailPage'));
const ProfileSetupPage = lazy(() => import('@/features/auth/ProfileSetupPage'));
const UnauthorizedPage = lazy(() => import('@/features/auth/UnauthorizedPage'));

// Landing
const LandingPage = lazy(() => import('@/features/landing/LandingPage'));

// Main
const Dashboard = lazy(() => import('@/features/dashboard/DashboardRouter'));
const IssuesList = lazy(() => import('@/features/issues/IssuesListPage'));
const ReportIssue = lazy(() => import('@/features/issues/ReportIssuePage'));
const IssueDetail = lazy(() => import('@/features/issues/IssueDetailPage'));
const MapPage = lazy(() => import('@/features/map/MapPage'));
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const CommunityFeedPage = lazy(() => import('@/features/community/CommunityFeedPage'));

// Misc
const NotFound = lazy(() => import('@/features/misc/NotFoundPage'));

// ─── Loading fallback ───

function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

function Lazy({ Component }: { Component: React.LazyExoticComponent<() => JSX.Element> }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

// ─── Router ───

export const router = createBrowserRouter([
  // Public landing page
  {
    path: '/',
    element: <Lazy Component={LandingPage} />,
  },
  // Protected app routes (requires auth + verified + profile)
  {
    path: '/app',
    element: <ProtectedAppShell />,
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <Lazy Component={Dashboard} /> },
      { path: 'issues', element: <Lazy Component={IssuesList} /> },
      { path: 'issues/new', element: <Lazy Component={ReportIssue} /> },
      { path: 'issues/:id', element: <Lazy Component={IssueDetail} /> },
      { path: 'map', element: <Lazy Component={MapPage} /> },
      { path: 'community', element: <Lazy Component={CommunityFeedPage} /> },
      { path: 'notifications', element: <Lazy Component={NotificationsPage} /> },
      { path: 'analytics', element: <Lazy Component={AnalyticsPage} /> },
      { path: 'settings', element: <Lazy Component={SettingsPage} /> },
      { path: 'profile', element: <Lazy Component={ProfilePage} /> },
    ],
  },
  // Auth routes (public)
  {
    path: '/auth',
    element: <AuthLayout />,
    errorElement: <RouterErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <Lazy Component={LoginPage} /> },
      { path: 'register', element: <Lazy Component={RegisterPage} /> },
      { path: 'forgot-password', element: <Lazy Component={ForgotPasswordPage} /> },
      { path: 'verify-email', element: <Lazy Component={VerifyEmailPage} /> },
    ],
  },
  // Onboarding
  {
    path: '/onboarding/profile',
    element: <Lazy Component={ProfileSetupPage} />,
  },
  // Unauthorized
  {
    path: '/unauthorized',
    element: <Lazy Component={UnauthorizedPage} />,
  },
  // 404
  {
    path: '*',
    element: <Lazy Component={NotFound} />,
  },
]);
