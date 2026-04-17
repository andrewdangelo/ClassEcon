import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedAuthPersona, seedTeacherClass } from "../../support/fixtures";
import { loginThroughAuthPage } from "../../support/ui";

test.describe("Jobs posting and application journey", () => {
  test("teacher posts a job and student applies", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-jobs");
    await seedAuthPersona(request, "student-jobs", "STUDENT", seeded.joinCode);

    const teacherContext = await browser.newContext();
    await primeBetaBypass(teacherContext);
    const teacherPage = await teacherContext.newPage();

    await loginThroughAuthPage(teacherPage, "teacher-jobs");
    await teacherPage.goto("/jobs");
    await teacherPage.getByRole("button", { name: "Create Job" }).click();
    await teacherPage.locator("#title").fill("Class Messenger");
    await teacherPage.locator("#description").fill("Delivers papers and materials.");
    await teacherPage.locator("#salary").fill("30");
    await teacherPage.locator("#maxCapacity").fill("1");
    await teacherPage.getByRole("button", { name: "Create Job" }).click();
    await expect(teacherPage.getByText("Class Messenger")).toBeVisible();

    const studentContext = await browser.newContext();
    await primeBetaBypass(studentContext);
    const studentPage = await studentContext.newPage();
    await loginThroughAuthPage(studentPage, "student-jobs");
    await studentPage.goto("/jobs");
    await expect(studentPage.getByText("Class Messenger")).toBeVisible();
    await studentPage.getByRole("button", { name: "Apply Now" }).first().click();
    await studentPage.locator("#applicationText").fill("I am dependable and can help daily.");
    await studentPage.getByRole("button", { name: "Submit Application" }).click();
    await expect(studentPage.getByText("Application submitted successfully!")).toBeVisible();

    await teacherPage.reload();
    await teacherPage.getByRole("tab", { name: /Applications/ }).click();
    await expect(teacherPage.getByText("student-jobs", { exact: false })).toBeVisible();

    await teacherContext.close();
    await studentContext.close();
  });
});
