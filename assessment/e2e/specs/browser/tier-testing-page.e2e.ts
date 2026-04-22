/**
 * M-UI-2 @dev: Dev tier testing panel (supplement to API tier tests).
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass } from "../../support/fixtures";
import { loginAndLandDashboard } from "../../support/ui";

test.describe("@dev Tier testing page", () => {
  test("teacher can load subscription tier testing dev page", async ({ request, browser }) => {
    await seedTeacherClass(request, "teacher-ui-tierdev");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-tierdev");
    await page.goto("/dev/tier-testing");
    await expect(page.getByRole("heading", { name: "Subscription Tier Testing" })).toBeVisible();
    await expect(page.getByText("Feature Access Tests", { exact: false })).toBeVisible();

    await context.close();
  });
});
