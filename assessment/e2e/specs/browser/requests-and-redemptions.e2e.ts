/**
 * G1–G3: Requests pages; teacher redemption queue; student blocked from /redemptions.
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass, seedTeacherClassWithStudent } from "../../support/fixtures";
import { loginAndLandDashboard, loginThroughAuthPage } from "../../support/ui";

test.describe("Requests and redemptions routes", () => {
  test("teacher sees payment requests and redemption queue", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-ui-requests");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-requests");
    await page.goto("/requests");
    await expect(page.getByRole("heading", { name: /Manage payment requests/i })).toBeVisible();

    await page.goto("/redemptions");
    await expect(page.getByRole("heading", { name: "Redemption Requests" })).toBeVisible();

    await context.close();
  });

  test("student can open requests but not redemptions page", async ({ request, browser }) => {
    await seedTeacherClassWithStudent(request, "teacher-ui-redempt", "student-ui-redempt");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginThroughAuthPage(page, "student-ui-redempt");
    await expect.poll(() => page.url()).toContain("/");

    await page.goto("/requests");
    await expect(page.getByRole("heading", { name: "Payment requests" })).toBeVisible();

    await page.goto("/redemptions");
    await expect.poll(() => page.url()).toContain("/store");

    await context.close();
  });
});
