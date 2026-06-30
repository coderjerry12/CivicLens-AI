import { useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Error boundary specifically for React Router.
 * Catches errors thrown during route rendering/loading.
 * Does NOT use useNavigate to avoid potential issues.
 */
export function RouterErrorBoundary() {
  const error = useRouteError() as Error | undefined;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        {error && (
          <details className="w-full mb-4 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs text-red-700 bg-red-50 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {error.message || String(error)}
            </pre>
          </details>
        )}
        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl hover:bg-gray-50"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
