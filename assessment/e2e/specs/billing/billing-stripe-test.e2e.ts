import { test, expect } from "@playwright/test";
import { gql } from "../../support/graphql-client";
import { seedAuthPersona } from "../../support/fixtures";
import { E2E_ENV } from "../../support/env";

const CREATE_PAYMENT_CHECKOUT_MUTATION = `
  mutation CreatePaymentCheckout($tier: String!, $interval: String!) {
    createPaymentCheckout(tier: $tier, interval: $interval) {
      sessionId
      url
    }
  }
`;

test.describe("Billing Stripe test profile", () => {
  test("checkout session returns Stripe-hosted URL in stripe mode", async ({ request }) => {
    const stripeConfigured =
      Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) ||
      Boolean(process.env.E2E_ENABLE_STRIPE_BILLING === "true");

    test.skip(E2E_ENV.billingMode !== "stripe", "Run with E2E_BILLING_MODE=stripe");
    test.skip(!stripeConfigured, "Stripe test keys are not configured for this environment");

    const teacher = await seedAuthPersona(request, "teacher-billing-stripe", "TEACHER");
    const data = await gql<{
      createPaymentCheckout: { sessionId: string; url: string };
    }>(
      request,
      CREATE_PAYMENT_CHECKOUT_MUTATION,
      { tier: "STARTER", interval: "monthly" },
      teacher.accessToken
    );

    expect(data.createPaymentCheckout.sessionId).toMatch(/cs_/i);
    expect(data.createPaymentCheckout.url).toContain("stripe.com");
  });
});
