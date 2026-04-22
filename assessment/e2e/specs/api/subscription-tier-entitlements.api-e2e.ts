import { test, expect } from "@playwright/test";
import { gql } from "../../support/graphql-client";
import { seedAuthPersona } from "../../support/fixtures";
import { internalSubscriptionUpdate } from "../../support/internal-api";

/** Mirrors Backend/src/resolvers/payment.ts PLAN_LIMITS (product source for GraphQL mySubscription). */
const MY_SUBSCRIPTION = `
  query MySubscription {
    mySubscription {
      planTier
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
    }
  }
`;

type SubData = {
  mySubscription: {
    planTier: string;
    limits: {
      maxClasses: number | null;
      maxStudentsPerClass: number | null;
      maxStoreItems: number | null;
      maxJobs: number | null;
      customCurrency: boolean;
      analytics: boolean;
      exportData: boolean;
      prioritySupport: boolean;
    };
  };
};

test.describe("API subscription tiers (mySubscription limits)", () => {
  test("FREE and STARTER caps", async ({ request }) => {
    const teacher = await seedAuthPersona(request, "tier-api-free", "TEACHER");
    await internalSubscriptionUpdate(request, teacher.user.id, "FREE");

    const free = await gql<SubData>(request, MY_SUBSCRIPTION, {}, teacher.accessToken);
    expect(free.mySubscription.planTier).toBe("FREE");
    expect(free.mySubscription.limits.maxClasses).toBe(1);
    expect(free.mySubscription.limits.maxStudentsPerClass).toBe(30);
    expect(free.mySubscription.limits.analytics).toBe(false);

    await internalSubscriptionUpdate(request, teacher.user.id, "STARTER");
    const starter = await gql<SubData>(request, MY_SUBSCRIPTION, {}, teacher.accessToken);
    expect(starter.mySubscription.planTier).toBe("STARTER");
    expect(starter.mySubscription.limits.maxClasses).toBe(1);
    expect(starter.mySubscription.limits.maxStudentsPerClass).toBe(30);
    expect(starter.mySubscription.limits.analytics).toBe(false);
  });

  test("PROFESSIONAL: 5 classrooms, unlimited students, premium flags", async ({ request }) => {
    const teacher = await seedAuthPersona(request, "tier-api-pro", "TEACHER");
    await internalSubscriptionUpdate(request, teacher.user.id, "PROFESSIONAL");

    const data = await gql<SubData>(request, MY_SUBSCRIPTION, {}, teacher.accessToken);
    expect(data.mySubscription.planTier).toBe("PROFESSIONAL");
    expect(data.mySubscription.limits.maxClasses).toBe(5);
    expect(data.mySubscription.limits.maxStudentsPerClass).toBeNull();
    expect(data.mySubscription.limits.customCurrency).toBe(true);
    expect(data.mySubscription.limits.analytics).toBe(true);
    expect(data.mySubscription.limits.exportData).toBe(true);
  });

  test("SCHOOL: unlimited numeric limits", async ({ request }) => {
    const teacher = await seedAuthPersona(request, "tier-api-school", "TEACHER");
    await internalSubscriptionUpdate(request, teacher.user.id, "SCHOOL");

    const data = await gql<SubData>(request, MY_SUBSCRIPTION, {}, teacher.accessToken);
    expect(data.mySubscription.planTier).toBe("SCHOOL");
    expect(data.mySubscription.limits.maxClasses).toBeNull();
    expect(data.mySubscription.limits.maxStudentsPerClass).toBeNull();
    expect(data.mySubscription.limits.prioritySupport).toBe(true);
  });

  test("TRIAL: elevated limits per payment resolver", async ({ request }) => {
    const teacher = await seedAuthPersona(request, "tier-api-trial", "TEACHER");
    await internalSubscriptionUpdate(request, teacher.user.id, "TRIAL");

    const data = await gql<SubData>(request, MY_SUBSCRIPTION, {}, teacher.accessToken);
    expect(data.mySubscription.planTier).toBe("TRIAL");
    expect(data.mySubscription.limits.maxClasses).toBe(2);
    expect(data.mySubscription.limits.maxStudentsPerClass).toBe(30);
    expect(data.mySubscription.limits.analytics).toBe(true);
  });
});
