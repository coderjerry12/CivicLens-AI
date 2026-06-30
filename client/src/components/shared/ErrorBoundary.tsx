import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center text-center max-w-md animate-fade-in">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500 mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              An unexpected error occurred. Please try reloading the page.
            </p>
            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className="w-full mb-4 text-left">
                <summary className="text-xs text-text-muted cursor-pointer">Error details</summary>
                <pre className="mt-2 text-xs text-danger-700 bg-danger-50 rounded-[10px] p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button onClick={this.handleReload}>
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
