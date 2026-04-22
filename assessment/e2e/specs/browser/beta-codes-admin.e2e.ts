/**
 * K1–K2: Teacher reaches beta code admin; student redirected away.
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClassWithStudent } from "../../support/fixtures";
import { loginAndLandDashboard, loginThroughAuthPage } from "../../support/ui";

test.describe("Beta codes admin", () => {
  test("teacher opens beta admin; student cannot", async ({ request, browser }) => {
    await seedTeacherClassWithStudent(request, "teacher-ui-beta", "student-ui-beta");

    const tctx = await browser.newContext();
    await primeBetaBypass(tctx);
    const tpage = await tctx.newPage();
    await loginAndLandDashboard(tpage, "teacher-ui-beta");
    await tpage.goto("/admin/beta-codes");
    await expect(tpage.getByRole("heading", { name: "Beta Access Codes" })).toBeVisible();

    const sctx = await browser.newContext();
    await primeBetaBypass(sctx);
    const spage = await sctx.newPage();
    await loginThroughAuthPage(spage, "student-ui-beta");
    await expect.poll(() => spage.url()).toContain("/");
    await spage.goto("/admin/beta-codes");
    await expect.poll(() => spage.url()).toContain("/store");

    await tctx.close();
    await sctx.close();
  });
});
