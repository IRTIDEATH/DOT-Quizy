/**
 * This module validates required environment variables at startup
 * and exports a typed config object for use throughout the application.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'CLIENT_URL',
  'BETTER_AUTH_SECRET',
] as const;

function validateEnv(): void {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please ensure these are set in your .env file or environment.`
    );
  }
}

validateEnv();

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  clientUrl: process.env.CLIENT_URL!,
  betterAuthSecret: process.env.BETTER_AUTH_SECRET!,
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;
