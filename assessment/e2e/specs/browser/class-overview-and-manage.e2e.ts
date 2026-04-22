/**
 * B2–B3: Class overview from list; manage class screen reachable.
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass } from "../../support/fixtures";
import { loginAndLandDashboard } from "../../support/ui";

test.describe("Class overview and manage", () => {
  test("@smoke teacher opens class from list and reaches manage", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-class-overview");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-class-overview");
    await page.goto("/classes");
    await expect(page.getByText(seeded.className)).toBeVisible();
    await page.getByRole("button", { name: "Open" }).click();
    await expect(page).toHaveURL(new RegExp(`/classes/${seeded.classId}`));

    await page.goto(`/classes/${seeded.classId}/manage`);
    await expect(page.getByRole("heading", { name: "Manage Class" })).toBeVisible();

    await context.close();
  });
});
