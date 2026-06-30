/**
 * Environment variable validation.
 * Runs at app startup to catch missing config early instead of failing mysteriously at runtime.
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  { key: 'VITE_FIREBASE_API_KEY', required: true, description: 'Firebase API Key' },
  { key: 'VITE_FIREBASE_AUTH_DOMAIN', required: true, description: 'Firebase Auth Domain' },
  { key: 'VITE_FIREBASE_PROJECT_ID', required: true, description: 'Firebase Project ID' },
  { key: 'VITE_FIREBASE_STORAGE_BUCKET', required: true, description: 'Firebase Storage Bucket' },
  { key: 'VITE_FIREBASE_MESSAGING_SENDER_ID', required: true, description: 'Firebase Messaging Sender ID' },
  { key: 'VITE_FIREBASE_APP_ID', required: true, description: 'Firebase App ID' },
  { key: 'VITE_GOOGLE_MAPS_API_KEY', required: false, description: 'Google Maps API Key' },
  { key: 'VITE_API_URL', required: false, description: 'Backend API URL' },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_VARS) {
    const value = import.meta.env[envVar.key];

    if (!value || value === `your_${envVar.key.toLowerCase().replace('vite_', '')}`) {
      if (envVar.required) {
        missing.push(`${envVar.description} (${envVar.key})`);
      } else {
        warnings.push(`${envVar.description} (${envVar.key}) — feature may be unavailable`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Logs validation results to the console during development.
 * Does not block the app — just informs the developer.
 */
export function checkEnvOnStartup(): void {
  if (import.meta.env.PROD) return; // Skip in production

  const result = validateEnv();

  if (result.missing.length > 0) {
    console.warn(
      `%c⚠️ CivicLens AI — Missing required environment variables:\n` +
        result.missing.map((m) => `  • ${m}`).join('\n') +
        `\n\nCopy .env.example → .env and fill in your values.`,
      'color: #d97706; font-weight: bold;'
    );
  }

  if (result.warnings.length > 0) {
    console.info(
      `%cℹ️ CivicLens AI — Optional variables not set:\n` +
        result.warnings.map((w) => `  • ${w}`).join('\n'),
      'color: #6b7280;'
    );
  }

  if (result.valid && result.warnings.length === 0) {
    console.info('%c✅ CivicLens AI — All environment variables configured.', 'color: #16a34a;');
  }
}
