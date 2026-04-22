import { test, expect } from "@playwright/test";
import { primeBetaBypass } from "../../support/fixtures";
import { signupThroughAuthPage, expectRoute } from "../../support/ui";

test.describe("Teacher onboarding to classroom", () => {
  test("@smoke teacher signs up and creates first class", async ({ browser }) => {
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await signupThroughAuthPage(page, "teacherA", "TEACHER");
    await expectRoute(page, "/onboarding");

    await page.locator("#name").fill("Teacher UI Flow Class");
    await page.getByRole("button", { name: "Select a subject" }).click();
    await page.getByRole("option", { name: "Math" }).click();
    await page.locator("#period").fill("2nd");
    await page.getByRole("button", { name: "Create Class" }).click();

    await expect.poll(() => page.url()).toContain("/");
    await expect(page.getByText("Dashboard")).toBeVisible();

    await page.goto("/classes");
    await expect(page.getByText("Teacher UI Flow Class")).toBeVisible();

    await context.close();
  });
});
