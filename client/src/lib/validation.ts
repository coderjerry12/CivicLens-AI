/**
 * Form validation utilities.
 */

export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { valid: false, message: 'Email is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  return { valid: true, message: '' };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }
  return { valid: true, message: '' };
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too weak' | 'Weak' | 'Fair' | 'Strong' | 'Very strong';
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const capped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  const map: Record<number, { label: PasswordStrength['label']; color: string }> = {
    0: { label: 'Too weak', color: 'bg-danger-500' },
    1: { label: 'Weak', color: 'bg-danger-400' },
    2: { label: 'Fair', color: 'bg-accent-500' },
    3: { label: 'Strong', color: 'bg-success-400' },
    4: { label: 'Very strong', color: 'bg-success-500' },
  };

  return { score: capped, ...map[capped] };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value.trim()) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: '' };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone.trim()) {
    return { valid: true, message: '' }; // Optional
  }
  const phoneRegex = /^[+]?[\d\s-()]{7,15}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid phone number.' };
  }
  return { valid: true, message: '' };
}
