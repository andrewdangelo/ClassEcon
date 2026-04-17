import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const MY_SUBSCRIPTION_QUERY = gql`
  query MySubscription {
    mySubscription {
      id
      userId
      planTier
      status
      isFoundingMember
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
  planTier: 'FREE' | 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'SCHOOL';
  status: 'ACTIVE' | 'TRIAL' | 'CANCELED' | 'EXPIRED' | 'PAST_DUE';
  limits: SubscriptionLimits;
  isFoundingMember: boolean;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanInfo {
  tier: Subscription['planTier'];
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

interface MySubscriptionData {
  mySubscription: Subscription;
}

interface AvailablePlansData {
  availablePlans: PlanInfo[];
}

interface CanCreateClassData {
  canCreateClass: FeatureCheckResult;
}

interface CanAddStudentData {
  canAddStudent: FeatureCheckResult;
}

function getDaysRemaining(trialEndsAt?: string | null): number | undefined {
  if (!trialEndsAt) return undefined;
  const end = new Date(trialEndsAt).getTime();
  if (Number.isNaN(end)) return undefined;
  const msLeft = end - Date.now();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

/**
 * Hook to get the current user's subscription
 */
export function useSubscription() {
  const { data, loading, error, refetch } = useQuery<MySubscriptionData>(MY_SUBSCRIPTION_QUERY, {
    // Poll every 5 minutes to keep subscription status fresh
    pollInterval: 5 * 60 * 1000,
    // Use cache-and-network to show cached data while fetching fresh data
    fetchPolicy: 'cache-and-network',
  });
  const subscription = data?.mySubscription;
  const daysRemaining = getDaysRemaining(subscription?.trialEndsAt);

  return {
    subscription,
    loading,
    error,
    refetch,
    // Helper methods
    isOnTrial: subscription?.status === 'TRIAL',
    daysRemaining,
    isPremium: ['PROFESSIONAL', 'SCHOOL'].includes(subscription?.planTier || ''),
    isActive: ['ACTIVE', 'TRIAL'].includes(subscription?.status || ''),
    hasFeature: (feature: keyof SubscriptionLimits) => {
      const limits = subscription?.limits;
      if (!limits) return false;
      return (
        limits[feature] === true ||
        (typeof limits[feature] === 'number' && (limits[feature] as number) > 0)
      );
    },
    getLimit: (feature: keyof SubscriptionLimits) => {
      return subscription?.limits?.[feature];
    },
  };
}

/**
 * Hook to get available subscription plans
 */
export function useAvailablePlans() {
  const { data, loading, error } = useQuery<AvailablePlansData>(AVAILABLE_PLANS_QUERY);

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
  const { data, loading, error, refetch } = useQuery<CanCreateClassData>(CAN_CREATE_CLASS_QUERY);

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
  const { data, loading, error, refetch } = useQuery<CanAddStudentData>(CAN_ADD_STUDENT_QUERY, {
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
