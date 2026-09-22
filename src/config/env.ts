/**
 * Centralized environment configuration.
 * Validates required variables at startup.
 * NEVER prints secret values.
 */

function getEnv(key: string, required: boolean = false): string | undefined {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Copy .dev.vars.example to .dev.vars and configure your ${key}.`
    );
  }
  return value;
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Copy .dev.vars.example to .dev.vars and configure your ${key}.`
    );
  }
  return value;
}

// Lazy-initialized config (validated on first access)
let _config: AppConfig | null = null;

export interface AppConfig {
  // Database
  databaseUrl: string;

  // Better Auth
  betterAuthSecret: string;
  betterAuthUrl: string;

  // Bootstrap (optional — only needed for admin setup)
  adminBootstrapSecret: string | undefined;

  // Email (optional — only needed for sending)
  resendApiKey: string | undefined;

  // Contact form (optional — only needed for contact form)
  contactEmail: string | undefined;
  contactFrom: string | undefined;

  // R2 Storage (optional — only needed for file uploads)
  r2AccountId: string | undefined;
  r2AccessKeyId: string | undefined;
  r2SecretAccessKey: string | undefined;
  r2BucketName: string | undefined;

  // App
  environment: string;
  corsOrigin: string;
  appUrl: string;
}

export function getConfig(): AppConfig {
  // In Workers, each request is independent — don't cache across requests
  // Also, env vars may be set by middleware after first import
  _config = {
    databaseUrl: getEnvOrThrow("NEON_DATABASE_URL"),
    betterAuthSecret: getEnvOrThrow("BETTER_AUTH_SECRET"),
    betterAuthUrl: getEnv("BETTER_AUTH_URL") || "http://localhost:5173",
    adminBootstrapSecret: getEnv("ADMIN_BOOTSTRAP_SECRET"),
    resendApiKey: getEnv("RESEND_API_KEY"),
    contactEmail: getEnv("CONTACT_EMAIL"),
    contactFrom: getEnv("CONTACT_FROM"),
    r2AccountId: getEnv("R2_ACCOUNT_ID"),
    r2AccessKeyId: getEnv("R2_ACCESS_KEY_ID"),
    r2SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY"),
    r2BucketName: getEnv("R2_BUCKET_NAME"),
    environment: getEnv("ENVIRONMENT") || "development",
    corsOrigin: getEnv("CORS_ORIGIN") || "http://localhost:5173",
    appUrl: getEnv("APP_URL") || "http://localhost:5173",
  };

  return _config;
}

/**
 * Check if a config section is available.
 * Useful for optional features like R2, email, etc.
 */
export function isStorageAvailable(): boolean {
  try {
    const config = getConfig();
    return !!(config.r2AccountId && config.r2AccessKeyId && config.r2SecretAccessKey && config.r2BucketName);
  } catch {
    return false;
  }
}

export function isEmailAvailable(): boolean {
  try {
    const config = getConfig();
    return !!config.resendApiKey;
  } catch {
    return false;
  }
}
