import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

export const MY_SUBSCRIPTION_QUERY = gql`
  query MySubscription {
    mySubscription {
      id
      userId
      planTier
      status
      limits {
        maxClasses
        maxStudentsPerClass
        maxStoreItems
        maxJobs
        customCurrency
        analytics
        exportData
        prioritySupport
      }
      currentPeriodStart
      currentPeriodEnd
      trialEndsAt
      cancelAtPeriodEnd
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

export const AVAILABLE_PLANS_QUERY = gql`
  query AvailablePlans {
    availablePlans {
      tier
      name
      price
      billingPeriod
      limits {
        maxClasses
        maxStudentsPerClass
        maxStoreItems
        maxJobs
        customCurrency
        analytics
        exportData
        prioritySupport
      }
      features
      stripePriceId
    }
  }
`;

export const CAN_CREATE_CLASS_QUERY = gql`
  query CanCreateClass {
    canCreateClass {
      allowed
      currentUsage
      limit
      reason
    }
  }
`;

export const CAN_ADD_STUDENT_QUERY = gql`
  query CanAddStudent($classId: ID!) {
    canAddStudent(classId: $classId) {
      allowed
      currentUsage
      limit
      reason
    }
  }
`;

export interface SubscriptionLimits {
  maxClasses: number | null;
  maxStudentsPerClass: number | null;
  maxStoreItems: number | null;
  maxJobs: number | null;
  customCurrency: boolean;
  analytics: boolean;
  exportData: boolean;
  prioritySupport: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planTier: 'FREE_TRIAL' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED';
  limits: SubscriptionLimits;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanInfo {
  tier: string;
  name: string;
  price: number;
  billingPeriod: string;
  limits: SubscriptionLimits;
  features: string[];
  stripePriceId?: string;
}

export interface FeatureCheckResult {
  allowed: boolean;
  currentUsage?: number;
  limit?: number;
  reason?: string;
}

/**
 * Hook to get the current user's subscription
 */
export function useSubscription() {
  const { data, loading, error, refetch } = useQuery(MY_SUBSCRIPTION_QUERY, {
    // Poll every 5 minutes to keep subscription status fresh
    pollInterval: 5 * 60 * 1000,
    // Use cache-and-network to show cached data while fetching fresh data
    fetchPolicy: 'cache-and-network',
  });

  return {
    subscription: data?.mySubscription as Subscription | undefined,
    loading,
    error,
    refetch,
    // Helper methods
    isOnTrial: data?.mySubscription?.status === 'TRIAL',
    isPremium: ['PREMIUM', 'ENTERPRISE'].includes(data?.mySubscription?.planTier),
    isActive: ['ACTIVE', 'TRIAL'].includes(data?.mySubscription?.status),
    hasFeature: (feature: keyof SubscriptionLimits) => {
      const limits = data?.mySubscription?.limits;
      if (!limits) return false;
      return limits[feature] === true || (typeof limits[feature] === 'number' && limits[feature] > 0);
    },
    getLimit: (feature: keyof SubscriptionLimits) => {
      return data?.mySubscription?.limits?.[feature];
    },
  };
}

/**
 * Hook to get available subscription plans
 */
export function useAvailablePlans() {
  const { data, loading, error } = useQuery(AVAILABLE_PLANS_QUERY);

  return {
    plans: (data?.availablePlans || []) as PlanInfo[],
    loading,
    error,
  };
}

/**
 * Hook to check if user can create a class
 */
export function useCanCreateClass() {
  const { data, loading, error, refetch } = useQuery(CAN_CREATE_CLASS_QUERY);

  return {
    canCreate: data?.canCreateClass?.allowed ?? true,
    currentUsage: data?.canCreateClass?.currentUsage,
    limit: data?.canCreateClass?.limit,
    reason: data?.canCreateClass?.reason,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to check if user can add a student to a class
 */
export function useCanAddStudent(classId?: string) {
  const { data, loading, error, refetch } = useQuery(CAN_ADD_STUDENT_QUERY, {
    variables: { classId },
    skip: !classId,
  });

  return {
    canAdd: data?.canAddStudent?.allowed ?? true,
    currentUsage: data?.canAddStudent?.currentUsage,
    limit: data?.canAddStudent?.limit,
    reason: data?.canAddStudent?.reason,
    loading,
    error,
    refetch,
  };
}
