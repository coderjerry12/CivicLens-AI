import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Building2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { getAuthErrorMessage } from '@/lib/firebaseErrors';
import { validateEmail, validatePassword, getPasswordStrength, validateRequired } from '@/lib/validation';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { type UserRole } from '@/types';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    let valid = true;

    const nameResult = validateRequired(name, 'Full name');
    if (!nameResult.valid) { setNameError(nameResult.message); valid = false; } else { setNameError(''); }

    const emailResult = validateEmail(email);
    if (!emailResult.valid) { setEmailError(emailResult.message); valid = false; } else { setEmailError(''); }

    const passResult = validatePassword(password);
    if (!passResult.valid) { setPasswordError(passResult.message); valid = false; } else { setPasswordError(''); }

    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      valid = false;
    } else {
      setConfirmError('');
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email, password, name, role);
      // Signup successful — navigate to verify email
      navigate('/auth/verify-email');
    } catch (err: unknown) {
      console.log('[Register] Signup error caught:', err);
      setError(getAuthErrorMessage(err));
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/app/dashboard');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <Card className="w-full animate-slide-up">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Role Selection */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                icon={<User className="h-5 w-5" />}
                label="Citizen"
                description="Report & track issues"
                selected={role === 'citizen'}
                onClick={() => setRole('citizen')}
              />
              <RoleCard
                icon={<Building2 className="h-5 w-5" />}
                label="Authority"
                description="Manage & resolve issues"
                selected={role === 'authority'}
                onClick={() => setRole('authority')}
              />
            </div>
          </div>

          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
            error={nameError}
            autoComplete="name"
            required
          />

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

          {/* Password with strength meter */}
          <div>
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                error={passwordError}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Strength meter */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        i <= passwordStrength.score - 1 ? passwordStrength.color : 'bg-neutral-200'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-1">{passwordStrength.label}</p>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (confirmError) setConfirmError(''); }}
            error={confirmError}
            autoComplete="new-password"
            required
          />

          {error && (
            <div className="rounded-[10px] bg-danger-50 border border-danger-200 px-3 py-2.5" role="alert">
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading}>
            Create Account
          </Button>

          {isFeatureEnabled('GOOGLE_AUTH') && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface px-2 text-text-muted">or continue with</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handleGoogle}>
                Google
              </Button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Role Card ───

function RoleCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-[14px] border-2 p-4 transition-all duration-200',
        selected
          ? 'border-primary-500 bg-primary-50 text-primary-700'
          : 'border-border text-text-secondary hover:border-border-hover hover:bg-surface-hover'
      )}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs opacity-70">{description}</span>
    </button>
  );
}
