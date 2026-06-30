import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
} as const;

/**
 * Validates required environment variables on startup.
 * Logs warnings for missing optional vars.
 */
export function validateServerEnv(): void {
  const required: { key: keyof typeof env; label: string }[] = [
    { key: 'FIREBASE_PROJECT_ID', label: 'Firebase Project ID' },
    { key: 'FIREBASE_CLIENT_EMAIL', label: 'Firebase Client Email' },
    { key: 'FIREBASE_PRIVATE_KEY', label: 'Firebase Private Key' },
  ];

  const optional: { key: keyof typeof env; label: string }[] = [
    { key: 'GEMINI_API_KEY', label: 'Gemini API Key (AI features)' },
  ];

  const missing = required.filter((v) => !env[v.key]);
  const missingOptional = optional.filter((v) => !env[v.key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables:\n` +
        missing.map((v) => `   • ${v.label} (${v.key})`).join('\n') +
        `\n   Copy .env.example → .env and fill in values.\n`
    );
  }

  if (missingOptional.length > 0) {
    console.info(
      `ℹ️  Optional variables not set:\n` +
        missingOptional.map((v) => `   • ${v.label} (${v.key})`).join('\n') + '\n'
    );
  }

  if (missing.length === 0 && missingOptional.length === 0) {
    console.info('✅ All environment variables configured.');
  }
}
