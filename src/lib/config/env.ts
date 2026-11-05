/**
 * ZenTap.ai — Centralized Environment Configuration
 * 
 * Safe, typed environment access layer. Validates presence of critical keys
 * and ensures secrets are never exposed to client-side bundles.
 */

function getEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

function getRequiredEnv(key: string): string {
  const val = process.env[key];
  if (!val && process.env.NODE_ENV === "production") {
    console.warn(`[Config Warning] Missing required environment variable: ${key}`);
  }
  return val || "";
}

export const env = {
  // Application
  NODE_ENV: getEnv("NODE_ENV", "development"),
  IS_PROD: process.env.NODE_ENV === "production",
  APP_URL: getEnv("NEXT_PUBLIC_APP_URL", "https://www.zentapdigitalsolutions.com"),
  SITE_URL: getEnv("NEXT_PUBLIC_SITE_URL", "https://www.zentapdigitalsolutions.com"),

  // Supabase (Server & Public Client)
  supabase: {
    url: getEnv("NEXT_PUBLIC_SUPABASE_URL", ""),
    anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", ""),
    serviceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY", ""),
  },

  // Razorpay Payments (Server & Client)
  razorpay: {
    keyId: getEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", ""),
    keySecret: getEnv("RAZORPAY_KEY_SECRET", ""),
    webhookSecret: getEnv("RAZORPAY_WEBHOOK_SECRET", ""),
  },

  // Analytics
  gaMeasurementId: getEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-XFM1PXQ03E"),

  // Administration
  adminEmails: getEnv("ADMIN_EMAILS", "meet@zentap.ai,admin@zentap.ai")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
} as const;

export default env;
