import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button, Card, CardContent } from '@/components/ui';
import { getAuthErrorMessage } from '@/lib/firebaseErrors';

export default function VerifyEmailPage() {
  const { user, firebaseUser, sendVerification, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResend = async () => {
    setError('');
    setMessage('');
    setResending(true);
    try {
      await sendVerification();
      setMessage('Verification email sent! Check your inbox.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setError('');
    setChecking(true);
    try {
      await refreshUser();
      // After refresh, check the firebase user directly
      if (firebaseUser) {
        await firebaseUser.reload();
        if (firebaseUser.emailVerified) {
          navigate('/onboarding/profile');
          return;
        }
      }
      setError('Email not verified yet. Please check your inbox and click the verification link.');
    } catch {
      setError('Could not check verification status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <Card className="w-full animate-scale-in">
      <CardContent>
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-4">
            <MailCheck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Verify your email</h3>
          <p className="text-sm text-text-secondary max-w-xs mb-2">
            We've sent a verification link to:
          </p>
          <p className="text-sm font-medium text-text-primary mb-6">
            {user?.email || 'your email'}
          </p>

          {message && (
            <div className="w-full rounded-[10px] bg-success-50 border border-success-200 px-3 py-2.5 mb-4">
              <p className="text-sm text-success-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="w-full rounded-[10px] bg-danger-50 border border-danger-200 px-3 py-2.5 mb-4" role="alert">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <div className="w-full space-y-3">
            <Button className="w-full" onClick={handleCheckVerification} isLoading={checking}>
              I've verified my email
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResend}
              isLoading={resending}
            >
              <RefreshCw className="h-4 w-4" />
              Resend verification email
            </Button>
            <button
              onClick={handleSignOut}
              className="w-full text-sm text-text-muted hover:text-text-secondary transition-colors mt-2"
            >
              Use a different account
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
