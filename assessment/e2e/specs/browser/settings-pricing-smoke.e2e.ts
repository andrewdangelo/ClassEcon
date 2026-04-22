/**
 * I1–I2: Settings loads; pricing marketing visible for FREE-tier user.
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass } from "../../support/fixtures";
import { loginAndLandDashboard } from "../../support/ui";

test.describe("Settings and pricing smoke", () => {
  test("@smoke teacher opens settings and pricing", async ({ request, browser }) => {
    await seedTeacherClass(request, "teacher-ui-settings");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-settings");

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /simple, transparent pricing/i })).toBeVisible();

    await context.close();
  });
});
