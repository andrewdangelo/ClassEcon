/**
 * Server-to-server calls to the EmailService GraphQL API (Resend + Mongo queue).
 */

type GraphQLResponse<T> = { data?: T; errors?: { message: string }[] };

const baseUrl = () => (process.env.EMAIL_SERVICE_URL || "").replace(/\/$/, "");
const serviceToken = () => process.env.EMAIL_SERVICE_TOKEN || "";

export function isEmailServiceConfigured(): boolean {
  return Boolean(baseUrl() && serviceToken());
}

export async function emailServiceGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = baseUrl();
  const token = serviceToken();
  if (!url || !token) {
    throw new Error("Email service is not configured (EMAIL_SERVICE_URL / EMAIL_SERVICE_TOKEN)");
  }

  const res = await fetch(`${url}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-service-token": token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphQLResponse<T>;
  if (!res.ok) {
    throw new Error(`Email service HTTP ${res.status}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || "Email service GraphQL error");
  }
  if (!json.data) {
    throw new Error("Email service returned empty data");
  }
  return json.data;
}

export async function sendPasswordResetEmail(params: {
  userId: string;
  email: string;
  redirectUrl: string;
}): Promise<void> {
  const mutation = `
    mutation SendPasswordReset($input: SendPasswordResetInput!) {
      sendPasswordReset(input: $input)
    }
  `;
  await emailServiceGraphQL<{ sendPasswordReset: boolean }>(mutation, { input: params });
}

export async function consumePasswordResetToken(params: {
  email: string;
  token: string;
}): Promise<void> {
  const mutation = `
    mutation ConsumePasswordReset($input: ConsumePasswordResetInput!) {
      consumePasswordReset(input: $input)
    }
  `;
  await emailServiceGraphQL<{ consumePasswordReset: boolean }>(mutation, { input: params });
}

export async function subscribeMailingList(params: {
  email: string;
  tags?: string[];
}): Promise<void> {
  const mutation = `
    mutation Subscribe($input: SubscribeInput!) {
      subscribe(input: $input) { id email status }
    }
  `;
  await emailServiceGraphQL<{ subscribe: { id: string } }>(mutation, { input: params });
}

export async function sendEmail2FA(params: { userId: string; email: string }): Promise<void> {
  const mutation = `
    mutation Send2FA($input: SendEmail2FAInput!) {
      sendEmail2FA(input: $input)
    }
  `;
  await emailServiceGraphQL<{ sendEmail2FA: boolean }>(mutation, { input: params });
}

export async function verifyEmail2FA(params: {
  userId: string;
  email: string;
  code: string;
}): Promise<void> {
  const mutation = `
    mutation Verify2FA($input: VerifyEmail2FAInput!) {
      verifyEmail2FA(input: $input)
    }
  `;
  await emailServiceGraphQL<{ verifyEmail2FA: boolean }>(mutation, { input: params });
}
