import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/services/offlineService';

/**
 * Shows a banner when the user is offline.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[300] bg-danger-600 text-white px-4 py-2 text-center animate-slide-down">
      <div className="flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span className="font-medium">You're offline.</span>
        <span className="text-danger-100">Some features may not work until you reconnect.</span>
      </div>
    </div>
  );
}
