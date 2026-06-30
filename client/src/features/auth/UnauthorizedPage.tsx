import { useNavigate } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center max-w-md animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger-500 mb-4">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Access Denied</h1>
        <p className="text-sm text-text-secondary mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/app/dashboard')}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
