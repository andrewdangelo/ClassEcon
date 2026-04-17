import { expect, Page } from "@playwright/test";
import { personaEmail, personaName, testPassword, Persona } from "./test-data";

export async function openSignup(page: Page) {
  await page.goto("/auth");
  await page.getByRole("tab", { name: "Sign Up" }).click();
}

export async function signupThroughAuthPage(
  page: Page,
  persona: Persona,
  role: "TEACHER" | "STUDENT",
  joinCode?: string
) {
  await openSignup(page);
  await page.locator("#signup-name").fill(personaName(persona));
  await page.locator("#signup-email").fill(personaEmail(persona));
  await page.locator("#signup-password").fill(testPassword);
  await page.locator("#signup-confirm-password").fill(testPassword);
  await page.locator("#signup-role").selectOption(role);
  if (joinCode) {
    await page.locator("#signup-join-code").fill(joinCode);
  }
  await page.getByRole("button", { name: "Create account" }).click();
}

export async function loginThroughAuthPage(page: Page, persona: Persona) {
  await page.goto("/auth");
  await page.locator("#login-email").fill(personaEmail(persona));
  await page.locator("#login-password").fill(testPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function expectRoute(page: Page, fragment: string) {
  await expect
    .poll(() => page.url(), {
      message: `Expected URL to include ${fragment}`,
    })
    .toContain(fragment);
}
