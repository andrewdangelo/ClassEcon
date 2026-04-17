import { test, expect } from "@playwright/test";
import { primeBetaBypass, seedAuthPersona, seedStoreItem, seedTeacherClass } from "../../support/fixtures";
import { loginThroughAuthPage } from "../../support/ui";

test.describe("Store purchase journey", () => {
  test("student purchases teacher-created item", async ({ request, browser }) => {
    const seeded = await seedTeacherClass(request, "teacher-store");
    await seedStoreItem(request, seeded.teacher.accessToken, seeded.classId, "Pencil Pack");
    await seedAuthPersona(request, "student-store", "STUDENT", seeded.joinCode);

    const context = await browser.newContext();
    await primeBetaBypass(context);
    const page = await context.newPage();

    await loginThroughAuthPage(page, "student-store");
    await page.goto("/store");
    await expect(page.getByText("Pencil Pack")).toBeVisible();

    await page.getByRole("button", { name: "Add to Cart" }).first().click();
    await page.goto("/cart");
    await expect(page.getByText("Pencil Pack")).toBeVisible();
    await page.getByRole("button", { name: /Purchase for CE\$/ }).click();

    await expect(page.getByText("Purchase successful!")).toBeVisible();
    await expect.poll(() => page.url()).toContain("/store");

    await context.close();
  });
});
