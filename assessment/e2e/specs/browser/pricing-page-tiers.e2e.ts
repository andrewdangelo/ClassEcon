/**
 * M-UI-1: Marketing tiers on /pricing (Starter, Professional, School).
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass } from "../../support/fixtures";
import { loginAndLandDashboard } from "../../support/ui";

test.describe("Pricing page tiers", () => {
  test("@smoke shows Starter, Professional, and School plans", async ({ request, browser }) => {
    await seedTeacherClass(request, "teacher-ui-pricing");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-pricing");
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /simple, transparent pricing/i })).toBeVisible();

    await expect(page.getByText("Starter", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Professional", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("School", { exact: true }).first()).toBeVisible();

    await expect(page.getByText(/\$9/).first()).toBeVisible();
    await expect(page.getByText(/\$19/).first()).toBeVisible();
    await expect(page.getByText("Custom", { exact: true }).first()).toBeVisible();

    await expect(page.getByText("Up to 30 students", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Start Free Trial" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Contact Sales" }).first()).toBeVisible();

    await context.close();
  });
});
