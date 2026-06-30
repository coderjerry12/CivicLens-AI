import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { getAuthErrorMessage } from '@/lib/firebaseErrors';
import { validateEmail } from '@/lib/validation';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      setEmailError(emailResult.message);
      return;
    }
    setEmailError('');

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full animate-scale-in">
        <CardContent>
          <div className="flex flex-col items-center text-center py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-600 mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Check your email</h3>
            <p className="text-sm text-text-secondary max-w-xs mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
            </p>
            <Link to="/auth/login">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full animate-slide-up">
      <CardContent>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 mb-3">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Forgot your password?</h3>
          <p className="text-sm text-text-secondary mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
            error={emailError}
            autoComplete="email"
            required
          />

          {error && (
            <div className="rounded-[10px] bg-danger-50 border border-danger-200 px-3 py-2.5" role="alert">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to="/auth/login" className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-700">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
