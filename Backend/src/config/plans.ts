import { PlanTier } from "../models/Subscription";

export interface PlanFeatures {
  tier: PlanTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    maxClasses: number;
    maxStudentsPerClass: number;
    maxStoreItems: number;
    maxJobs: number;
    customCurrency: boolean;
    analytics: boolean;
    exportData: boolean;
    prioritySupport: boolean;
  };
  features: string[];
  stripeMonthlyPriceId?: string;
  stripeYearlyPriceId?: string;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanFeatures> = {
  [PlanTier.FREE_TRIAL]: {
    tier: PlanTier.FREE_TRIAL,
    name: "Free Trial",
    description: "14-day trial with full premium features",
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      maxClasses: 2,
      maxStudentsPerClass: 30,
      maxStoreItems: 20,
      maxJobs: 10,
      customCurrency: true,
      analytics: true,
      exportData: true,
      prioritySupport: false,
    },
    features: [
      "All Premium features for 14 days",
      "Up to 2 classes",
      "Up to 30 students per class",
      "Advanced analytics",
      "Custom currency",
      "No credit card required",
    ],
  },

  [PlanTier.BASIC]: {
    tier: PlanTier.BASIC,
    name: "Basic",
    description: "Perfect for individual teachers",
    price: {
      monthly: 9.99,
      yearly: 99.99, // ~$8.33/month
    },
    limits: {
      maxClasses: 3,
      maxStudentsPerClass: 35,
      maxStoreItems: 30,
      maxJobs: 15,
      customCurrency: false,
      analytics: false,
      exportData: false,
      prioritySupport: false,
    },
    features: [
      "Up to 3 classes",
      "Up to 35 students per class",
      "30 store items",
      "15 job positions",
      "Basic reporting",
      "Email support",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_BASIC_YEARLY_PRICE_ID,
  },

  [PlanTier.PREMIUM]: {
    tier: PlanTier.PREMIUM,
    name: "Premium",
    description: "For dedicated educators",
    price: {
      monthly: 19.99,
      yearly: 199.99, // ~$16.67/month
    },
    limits: {
      maxClasses: 10,
      maxStudentsPerClass: 50,
      maxStoreItems: 100,
      maxJobs: 50,
      customCurrency: true,
      analytics: true,
      exportData: true,
      prioritySupport: false,
    },
    features: [
      "Up to 10 classes",
      "Up to 50 students per class",
      "Unlimited store items",
      "Unlimited jobs",
      "Advanced analytics & insights",
      "Custom currency names",
      "Export data to CSV/Excel",
      "Priority email support",
    ],
    stripeMonthlyPriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  },

  [PlanTier.ENTERPRISE]: {
    tier: PlanTier.ENTERPRISE,
    name: "Enterprise",
    description: "For schools and districts",
    price: {
      monthly: 0, // Custom pricing
      yearly: 0,
    },
    limits: {
      maxClasses: -1, // Unlimited
      maxStudentsPerClass: -1,
      maxStoreItems: -1,
      maxJobs: -1,
      customCurrency: true,
      analytics: true,
      exportData: true,
      prioritySupport: true,
    },
    features: [
      "Unlimited classes",
      "Unlimited students",
      "Unlimited everything",
      "Advanced analytics dashboard",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "Priority phone & email support",
      "Custom integrations",
      "SLA guarantee",
    ],
  },
};

// Helper to check if a feature is available in a plan
export function hasFeature(
  tier: PlanTier,
  feature: keyof PlanFeatures["limits"]
): boolean {
  return PLAN_CONFIGS[tier].limits[feature] === true;
}

// Helper to get limit value
export function getLimit(
  tier: PlanTier,
  limit: keyof PlanFeatures["limits"]
): number | boolean {
  return PLAN_CONFIGS[tier].limits[limit];
}
