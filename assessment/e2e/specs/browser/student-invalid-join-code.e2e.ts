/**
 * C2: Invalid join code does not enroll student (signup still succeeds).
 */
import { test, expect } from "@playwright/test";
import { primeBetaBypass } from "../../support/fixtures";
import { signupThroughAuthPage, expectRoute } from "../../support/ui";

test.describe("Student signup with bad join code", () => {
  test("student is not placed in a class when join code is invalid", async ({ browser }) => {
    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await signupThroughAuthPage(page, "student-bad-join", "STUDENT", "INVALID-CODE-XYZ");
    await expectRoute(page, "/");

    await page.goto("/classes");
    await expect(page.getByText("No Classes Yet")).toBeVisible();

    await context.close();
  });
});
