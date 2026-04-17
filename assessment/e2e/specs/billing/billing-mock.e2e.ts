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

test.describe("Billing mock profile", () => {
  test("checkout session is available in mock billing mode", async ({ request }) => {
    test.skip(E2E_ENV.billingMode !== "mock", "Run with E2E_BILLING_MODE=mock");

    const teacher = await seedAuthPersona(request, "teacher-billing-mock", "TEACHER");
    const data = await gql<{
      createPaymentCheckout: { sessionId: string; url: string };
    }>(
      request,
      CREATE_PAYMENT_CHECKOUT_MUTATION,
      { tier: "STARTER", interval: "monthly" },
      teacher.accessToken
    );

    expect(data.createPaymentCheckout.sessionId.length).toBeGreaterThan(0);
    expect(data.createPaymentCheckout.url.length).toBeGreaterThan(0);
  });
});
