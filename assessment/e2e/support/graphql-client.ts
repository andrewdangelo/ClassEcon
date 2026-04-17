import { APIRequestContext, expect } from "@playwright/test";
import { E2E_ENV } from "./env";

type GraphQLResult<T> = { data?: T; errors?: Array<{ message: string }> };

export async function gql<T>(
  request: APIRequestContext,
  query: string,
  variables?: Record<string, unknown>,
  token?: string
): Promise<T> {
  const response = await request.post(E2E_ENV.graphqlUrl, {
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    data: { query, variables },
  });

  expect(response.ok(), `GraphQL HTTP failure: ${response.status()}`).toBeTruthy();
  const payload = (await response.json()) as GraphQLResult<T>;

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(" | "));
  }
  if (!payload.data) {
    throw new Error("GraphQL response contained no data");
  }
  return payload.data;
}
