/**
 * F1–F3: Teacher issues fine via UI; student blocked from fines management route.
 */
import { test, expect } from "@playwright/test";
import { personaName } from "../../support/test-data";
import { primeBetaBypass, seedTeacherClassWithStudent } from "../../support/fixtures";
import { loginAndLandDashboard, loginThroughAuthPage } from "../../support/ui";

test.describe("Fines teacher and student access", () => {
  test("teacher issues a fine and student cannot open fines management", async ({
    request,
    browser,
  }) => {
    const seeded = await seedTeacherClassWithStudent(
      request,
      "teacher-ui-fines",
      "student-ui-fines"
    );
    const studentLabel = personaName("student-ui-fines");

    const teacherCtx = await browser.newContext();
    await primeBetaBypass(teacherCtx);
    const tpage = await teacherCtx.newPage();
    await loginAndLandDashboard(tpage, "teacher-ui-fines");

    await tpage.goto(`/classes/${seeded.classId}/fines`);
    await expect(tpage.getByRole("heading", { name: "Fines Management" })).toBeVisible();
    await tpage.getByRole("button", { name: "Issue Fine" }).first().click();
    const dialog = tpage.getByRole("dialog");
    await dialog.getByRole("combobox").click();
    await tpage.getByRole("option", { name: studentLabel }).click();
    await dialog.locator("#amount").fill("5");
    await dialog.locator("#reason").fill("E2E tardiness");
    await dialog.getByRole("button", { name: "Issue Fine" }).click();
    await expect(tpage.getByText("E2E tardiness")).toBeVisible();

    const studentCtx = await browser.newContext();
    await primeBetaBypass(studentCtx);
    const spage = await studentCtx.newPage();
    await loginThroughAuthPage(spage, "student-ui-fines");
    await expect.poll(() => spage.url()).toContain("/");

    await spage.goto(`/classes/${seeded.classId}/fines`);
    await expect.poll(() => spage.url()).toContain("/store");

    await teacherCtx.close();
    await studentCtx.close();
  });
});
