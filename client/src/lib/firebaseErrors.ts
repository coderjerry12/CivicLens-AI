/**
 * Maps Firebase error codes to user-friendly messages.
 * Never expose raw Firebase errors to users.
 */

const errorMap: Record<string, string> = {
  // Auth errors
  'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'The password is incorrect. Please try again.',
  'auth/invalid-credential': 'Invalid email or password. Please try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/requires-recent-login': 'Please sign in again to complete this action.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid. Please request a new one.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';
  
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return errorMap[code] || `Something went wrong. Please try again. (${code})`;
  }
  
  if (error instanceof Error) {
    // Don't expose raw error messages to users
    console.warn('[Auth Error]:', error.message);
    return 'Something went wrong. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
}
