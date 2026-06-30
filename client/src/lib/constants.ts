/**
 * Application-wide constants.
 */

export const APP_NAME = 'CivicLens AI';
export const APP_DESCRIPTION =
  'AI-powered hyperlocal community issue reporting and resolution platform';

// ─── Route Paths ───

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ISSUES: '/issues',
  ISSUE_DETAIL: '/issues/:id',
  REPORT_ISSUE: '/issues/new',
  MAP: '/map',
  NOTIFICATIONS: '/notifications',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  NOT_FOUND: '*',
} as const;

// ─── Issue Categories ───

export const ISSUE_CATEGORIES = [
  { value: 'pothole', label: 'Pothole', icon: 'CircleAlert' },
  { value: 'water_leakage', label: 'Water Leakage', icon: 'Droplets' },
  { value: 'garbage', label: 'Garbage', icon: 'Trash2' },
  { value: 'streetlight', label: 'Streetlight', icon: 'Lightbulb' },
  { value: 'road_hazard', label: 'Road Hazard', icon: 'TriangleAlert' },
  { value: 'drainage', label: 'Drainage', icon: 'Waves' },
  { value: 'noise', label: 'Noise', icon: 'Volume2' },
  { value: 'other', label: 'Other', icon: 'HelpCircle' },
] as const;

// ─── Issue Statuses ───

export const ISSUE_STATUSES = [
  { value: 'reported', label: 'Reported', color: 'accent' },
  { value: 'validated', label: 'Validated', color: 'primary' },
  { value: 'in_progress', label: 'In Progress', color: 'secondary' },
  { value: 'resolved', label: 'Resolved', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'neutral' },
] as const;

// ─── Priority Levels ───

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'neutral' },
  { value: 'medium', label: 'Medium', color: 'accent' },
  { value: 'high', label: 'High', color: 'danger' },
  { value: 'critical', label: 'Critical', color: 'danger' },
] as const;

// ─── Navigation Items ───

export const NAV_ITEMS = {
  citizen: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Report Issue', path: '/issues/new', icon: 'PlusCircle' },
    { label: 'My Issues', path: '/issues', icon: 'ClipboardList' },
    { label: 'Map', path: '/map', icon: 'Map' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
  ],
  authority: [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'All Issues', path: '/issues', icon: 'ClipboardList' },
    { label: 'Map', path: '/map', icon: 'Map' },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
    { label: 'Notifications', path: '/notifications', icon: 'Bell' },
  ],
} as const;
