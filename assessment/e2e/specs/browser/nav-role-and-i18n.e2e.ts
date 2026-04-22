/**
 * J1–J3: Role-specific nav; language switch; theme persists.
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass, seedTeacherClassWithStudent } from "../../support/fixtures";
import { loginAndLandDashboard, loginThroughAuthPage } from "../../support/ui";

test.describe("Navigation, i18n, and theme", () => {
  test("teacher nav shows redemptions; student nav shows backpack", async ({ request, browser }) => {
    await seedTeacherClassWithStudent(request, "teacher-ui-nav", "student-ui-nav");

    const tctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await primeBetaBypass(tctx);
    const tpage = await tctx.newPage();
    await loginAndLandDashboard(tpage, "teacher-ui-nav");
    await expect(tpage.getByRole("navigation", { name: "Teacher navigation" })).toContainText(
      "Redemptions"
    );
    await expect(tpage.getByRole("navigation", { name: "Teacher navigation" })).not.toContainText(
      "Backpack"
    );

    const sctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await primeBetaBypass(sctx);
    const spage = await sctx.newPage();
    await loginThroughAuthPage(spage, "student-ui-nav");
    await expect.poll(() => spage.url()).toContain("/");
    await expect(spage.getByRole("navigation", { name: "Student navigation" })).toContainText(
      "Backpack"
    );

    await tctx.close();
    await sctx.close();
  });

  test("settings language switch updates nav copy", async ({ request, browser }) => {
    await seedTeacherClass(request, "teacher-ui-i18n");
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-i18n");
    await page.goto("/settings");
    await page.getByRole("button", { name: /Español/ }).click();
    await expect(page.getByRole("navigation", { name: "Teacher navigation" })).toContainText(
      "Estudiantes"
    );

    await context.close();
  });

  test("theme toggle persists in localStorage after reload", async ({ request, browser }) => {
    await seedTeacherClass(request, "teacher-ui-theme");
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginAndLandDashboard(page, "teacher-ui-theme");
    await page.goto("/settings");
    const initial = await page.evaluate(() => localStorage.getItem("theme"));
    const darkOrLight = page.getByRole("button", { name: /Dark Mode|Light Mode/ });
    await darkOrLight.click();
    const toggled = await page.evaluate(() => localStorage.getItem("theme"));
    expect(toggled).not.toBe(initial);

    await page.reload();
    const afterReload = await page.evaluate(() => localStorage.getItem("theme"));
    expect(afterReload).toBe(toggled);

    await context.close();
  });
});
