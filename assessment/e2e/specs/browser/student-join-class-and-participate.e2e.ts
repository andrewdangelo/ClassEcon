import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedTeacherClass } from "../../support/fixtures";
import { signupThroughAuthPage, expectRoute } from "../../support/ui";

test.describe("Student joins class via signup", () => {
  test("student signs up with join code and reaches app", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-join");

    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await signupThroughAuthPage(page, "student-join", "STUDENT", seeded.joinCode);
    await expectRoute(page, "/");

    await page.goto("/classes");
    await expect(page.getByText(seeded.className)).toBeVisible();

    await page.goto("/jobs");
    await expect(page.getByText("Job Board")).toBeVisible();

    await context.close();
  });
});
