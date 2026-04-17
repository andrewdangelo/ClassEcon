// src/config.ts
import "dotenv/config";

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const env = {
  PORT: Number(process.env.PORT || 4002),
  NODE_ENV: optional("NODE_ENV", "development"),
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  BILLING_MODE: optional("BILLING_MODE", "stripe"),

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:4000"],

  // Stripe configuration
  STRIPE_SECRET_KEY:
    optional("BILLING_MODE", "stripe") === "mock"
      ? optional("STRIPE_SECRET_KEY", "sk_test_mock_key")
      : req("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET:
    optional("BILLING_MODE", "stripe") === "mock"
      ? optional("STRIPE_WEBHOOK_SECRET", "whsec_mock_secret")
      : req("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PUBLISHABLE_KEY: optional("STRIPE_PUBLISHABLE_KEY", ""),

  // Price IDs for subscription tiers
  STRIPE_PRICE_STARTER_MONTHLY: optional("STRIPE_PRICE_STARTER_MONTHLY", "price_starter_monthly"),
  STRIPE_PRICE_STARTER_YEARLY: optional("STRIPE_PRICE_STARTER_YEARLY", "price_starter_yearly"),
  STRIPE_PRICE_PROFESSIONAL_MONTHLY: optional("STRIPE_PRICE_PROFESSIONAL_MONTHLY", "price_pro_monthly"),
  STRIPE_PRICE_PROFESSIONAL_YEARLY: optional("STRIPE_PRICE_PROFESSIONAL_YEARLY", "price_pro_yearly"),
  STRIPE_PRICE_SCHOOL_MONTHLY: optional("STRIPE_PRICE_SCHOOL_MONTHLY", "price_school_monthly"),
  STRIPE_PRICE_SCHOOL_YEARLY: optional("STRIPE_PRICE_SCHOOL_YEARLY", "price_school_yearly"),

  // Founding member coupon
  STRIPE_COUPON_FOUNDING: optional("STRIPE_COUPON_FOUNDING", "FOUNDING50"),

  // Backend service URL for callbacks
  BACKEND_URL: optional("BACKEND_URL", "http://localhost:4000"),
  BACKEND_API_KEY: optional("BACKEND_API_KEY", ""),

  // Frontend URLs for redirects
  FRONTEND_URL: optional("FRONTEND_URL", "http://localhost:5173"),
  ADMIN_URL: optional("ADMIN_URL", "http://localhost:5175"),

  // MongoDB for payment records
  DATABASE_URL: optional("DATABASE_URL", ""),

  // JWT for validating tokens from other services
  JWT_SECRET: optional("JWT_SECRET", ""),
  
  // Service-to-service API key (for Backend to call PaymentService)
  SERVICE_API_KEY: optional("SERVICE_API_KEY", "dev-internal-key"),
};
