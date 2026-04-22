/**
 * H1–H2: Class activity view; backpack shows purchased item.
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedAuthPersona, seedStoreItem, seedTeacherClass } from "../../support/fixtures";
import { loginAndLandDashboard, loginThroughAuthPage } from "../../support/ui";

test.describe("Activity and backpack", () => {
  test("teacher views class activity page", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-ui-activity");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-activity");
    await page.goto(`/classes/${seeded.classId}/activity`);
    await expect(page.getByRole("heading", { name: "My Activity" })).toBeVisible();

    await context.close();
  });

  test("student sees purchased item in backpack", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-ui-backpack");
    await seedStoreItem(request, seeded.teacher.accessToken, seeded.classId, "Sticker Sheet");
    await seedAuthPersona(request, "student-ui-backpack", "STUDENT", seeded.joinCode);

    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginThroughAuthPage(page, "student-ui-backpack");
    await page.goto("/store");
    await expect(page.getByText("Sticker Sheet")).toBeVisible();
    await page.getByRole("button", { name: "Add to Cart" }).first().click();
    await page.goto("/cart");
    await page.getByRole("button", { name: /Purchase for CE\$/ }).click();
    await expect(page.getByText("Purchase successful!")).toBeVisible();

    await page.goto("/backpack");
    await expect(page.getByText("Sticker Sheet")).toBeVisible();

    await context.close();
  });
});
