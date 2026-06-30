import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Camera,
  Bell,
  BarChart3,
  Shield,
  Users,
  Zap,
  ArrowRight,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { useTheme } from '@/hooks/useTheme';

export default function LandingPage() {
  const navigate = useNavigate();
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#f4f7fc] dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200/80 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">{APP_NAME}</span>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 -mt-0.5">AI Community Issue Resolution</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">How It Works</a>
            <a href="#impact" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Impact</a>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              ) : (
                <Moon className="h-4 w-4 text-neutral-600" />
              )}
            </button>

            <button
              onClick={() => navigate('/auth/login')}
              className="hidden sm:block text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth/register')}
              className="flex items-center gap-2 rounded-[12px] bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 transition-colors shadow-md shadow-primary-600/20"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Gradient background shapes */}
        <div className="absolute top-10 left-1/4 w-[600px] h-[600px] bg-primary-200/40 dark:bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-32 right-1/4 w-[500px] h-[500px] bg-secondary-200/30 dark:bg-secondary-500/10 rounded-full blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10 px-4 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                </span>
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">Now Live in 12 Cities</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                <span className="text-neutral-900 dark:text-white">Hyperlocal </span>
                <span className="text-primary-600">Issue </span>
                <span className="text-primary-600">Reporting </span>
                <span className="text-neutral-900 dark:text-white">&amp; </span>
                <span className="text-secondary-600 dark:text-secondary-400">AI Resolution</span>
              </h1>

              <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                Empowering citizens to report infrastructure issues with AI-powered categorization.
                Authorities resolve faster with smart prioritization and real-time tracking.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/auth/register')}
                  className="flex items-center gap-2 rounded-[14px] bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-primary-500 shadow-lg shadow-primary-600/25 transition-all hover:-translate-y-0.5"
                >
                  <Zap className="h-4 w-4" />
                  Report an Issue
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="flex items-center gap-2 rounded-[14px] border-2 border-neutral-200 dark:border-white/20 bg-white dark:bg-white/5 px-6 py-3.5 text-sm font-semibold text-neutral-700 dark:text-white hover:border-primary-300 dark:hover:border-primary-500 transition-all"
                >
                  Authority Dashboard
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right: Dashboard Preview Card */}
            <div className="relative">
              <div className="rounded-[24px] border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-2xl shadow-neutral-200/50 dark:shadow-black/30 p-2">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-100 dark:border-white/5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="text-[11px] text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-md px-3 py-1">
                      civiclens.ai/dashboard
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-success-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* Mock content */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="Reported" value="847" color="text-primary-600" />
                    <MiniStat label="Resolved" value="634" color="text-success-600" />
                    <MiniStat label="Active" value="213" color="text-accent-600" />
                  </div>

                  {/* Issue items */}
                  <div className="space-y-2">
                    <MockIssue title="Pothole on MG Road" status="In Progress" statusColor="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" />
                    <MockIssue title="Broken streetlight" status="Reported" statusColor="bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400" />
                    <MockIssue title="Water leakage" status="Resolved" statusColor="bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400" />
                  </div>

                  {/* Terminal-style log */}
                  <div className="rounded-[10px] bg-neutral-900 dark:bg-black p-3 font-mono text-[10px] text-green-400 space-y-1">
                    <p>[AI] Image classified: pothole (confidence: 94.2%)</p>
                    <p>[GEO] Location: 12.9716°N, 77.5946°E</p>
                    <p>[ROUTE] Assigned to: Public Works Dept</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div id="impact" className="mt-20 rounded-[20px] border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 backdrop-blur-sm p-1 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-100 dark:divide-white/10">
              <LiveStat label="Issues Reported" value="2,847" />
              <LiveStat label="Resolved" value="2,134" />
              <LiveStat label="Active Cities" value="12" />
              <LiveStat label="Avg Resolution" value="3.2 days" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10 px-4 py-1.5 mb-4">
              <span className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Core Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
              State-of-the-Art Civic Tech
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              CivicLens AI integrates computer vision, geolocation intelligence,
              and real-time collaborative resolution tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Camera className="h-6 w-6" />}
              title="AI Image Analysis"
              description="Upload a photo and our AI instantly categorizes the issue type, estimates severity, and suggests priority."
              iconBg="bg-primary-100 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Geolocation Tracking"
              description="Auto-detect location via GPS. View all issues on an interactive map with heatmaps and clustering."
              iconBg="bg-secondary-100 dark:bg-secondary-900/30"
              iconColor="text-secondary-600 dark:text-secondary-400"
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Real-time Notifications"
              description="Instant updates when issue status changes. Track every step from report to resolution."
              iconBg="bg-accent-100 dark:bg-accent-900/30"
              iconColor="text-accent-600 dark:text-accent-400"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Community Validation"
              description="Citizens validate reported issues. Higher validation = higher priority for resolution."
              iconBg="bg-success-100 dark:bg-success-900/30"
              iconColor="text-success-600 dark:text-success-400"
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Authority Analytics"
              description="Resolution trends, department performance, hotspot detection, and predictive insights."
              iconBg="bg-danger-100 dark:bg-danger-900/30"
              iconColor="text-danger-600 dark:text-danger-400"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Transparent Resolution"
              description="Every issue has a public timeline. Full accountability and trust between citizens and authorities."
              iconBg="bg-primary-100 dark:bg-primary-900/30"
              iconColor="text-primary-600 dark:text-primary-400"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24 px-6 bg-white dark:bg-neutral-900/30 border-y border-neutral-200/50 dark:border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">
              Three simple steps to a better community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Report"
              description="Take a photo, add a description. Location is captured automatically via GPS."
            />
            <StepCard
              number="02"
              title="AI Analyzes"
              description="Our AI categorizes, prioritizes, and routes the issue to the right department."
            />
            <StepCard
              number="03"
              title="Track & Resolve"
              description="Real-time status updates. Get notified at every step until full resolution."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 dark:from-primary-600/5 to-transparent" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Ready to improve your community?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
            Join thousands of citizens making their neighborhoods better, one report at a time.
          </p>
          <button
            onClick={() => navigate('/auth/register')}
            className="inline-flex items-center gap-2 rounded-[14px] bg-primary-600 px-8 py-4 text-base font-semibold text-white hover:bg-primary-500 shadow-lg shadow-primary-600/25 transition-all hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" />
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-white/10 py-12 px-6 bg-white dark:bg-neutral-900/30">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white">{APP_NAME}</span>
            <span className="text-xs text-success-600 font-medium ml-2">All Systems Operational</span>
          </div>
          <p className="text-sm text-neutral-500">
            © 2025 {APP_NAME}. AI-Powered Community Issue Resolution.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ───

function LiveStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-4 text-center transition-all duration-300 hover:scale-105 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 rounded-[14px] cursor-default">
      <p className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-[10px] bg-neutral-50 dark:bg-neutral-800 p-2.5 text-center">
      <p className={cn('text-lg font-bold', color)}>{value}</p>
      <p className="text-[10px] text-neutral-500">{label}</p>
    </div>
  );
}

function MockIssue({ title, status, statusColor }: { title: string; status: string; statusColor: string }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] bg-neutral-50 dark:bg-neutral-800 px-3 py-2">
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-neutral-400" />
        <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{title}</span>
      </div>
      <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full', statusColor)}>{status}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="group rounded-[20px] border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/50 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-2 hover:border-primary-200 dark:hover:border-primary-500/30 hover:bg-gradient-to-br hover:from-white hover:to-primary-50/50 dark:hover:from-neutral-900 dark:hover:to-primary-950/30">
      <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-[12px] mb-4 transition-transform duration-300 group-hover:scale-110', iconBg, iconColor)}>
        {icon}
      </div>
      <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="group text-center transition-all duration-300 hover:-translate-y-2">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary-200 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-500/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/20 group-hover:border-primary-400 dark:group-hover:border-primary-400">
        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}
