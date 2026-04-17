import { expect } from "@playwright/test";

export async function expectGraphQLError(
  action: Promise<unknown>,
  expectedMessagePart: string
) {
  try {
    await action;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    expect(message).toContain(expectedMessagePart);
    return;
  }
  throw new Error(`Expected GraphQL error including "${expectedMessagePart}", but request succeeded`);
}
