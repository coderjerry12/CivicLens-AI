import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { EmptyState } from '@/components/shared';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <EmptyState
        icon={<FileQuestion className="h-8 w-8" />}
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        actionLabel="Back to Dashboard"
        onAction={() => navigate('/app/dashboard')}
      />
    </div>
  );
}
