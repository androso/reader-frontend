import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd());

export function validateEnv() {
  const requiredEnvVars = [
    'GOOGLE_ID',
    'GOOGLE_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
