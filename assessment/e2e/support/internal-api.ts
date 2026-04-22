import { APIRequestContext, expect } from "@playwright/test";
import { E2E_ENV } from "./env";

/**
 * Update teacher subscription tier via Backend internal API (same path PaymentService uses).
 * In local dev, INTERNAL_API_KEY may be unset and the route allows requests.
 */
export async function internalSubscriptionUpdate(
  request: APIRequestContext,
  userId: string,
  subscriptionTier: string
): Promise<void> {
  const url = `${E2E_ENV.backendBaseUrl}/api/internal/subscription-update`;
  const res = await request.post(url, {
    headers: {
      "content-type": "application/json",
      ...(E2E_ENV.internalApiKey ? { "x-api-key": E2E_ENV.internalApiKey } : {}),
    },
    data: { userId, subscriptionTier },
  });
  expect(res.ok(), `internal subscription-update failed: ${res.status()} ${await res.text()}`).toBeTruthy();
}
