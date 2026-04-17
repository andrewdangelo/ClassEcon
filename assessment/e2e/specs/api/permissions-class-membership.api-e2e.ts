import { test } from "@playwright/test";
import { expectGraphQLError } from "../../support/assertions";
import { gql } from "../../support/graphql-client";
import { seedAuthPersona, seedJob, seedStoreItem, seedTeacherClass } from "../../support/fixtures";

const MAKE_PURCHASE_MUTATION = `
  mutation MakePurchase($input: MakePurchaseInput!) {
    makePurchase(input: $input) { id }
  }
`;

const APPLY_FOR_JOB_MUTATION = `
  mutation ApplyForJob($input: ApplyForJobInput!) {
    applyForJob(input: $input) { id }
  }
`;

test.describe("API class membership checks", () => {
  test("non-member student cannot purchase or apply in another class", async ({ request }) => {
    const seededClass = await seedTeacherClass(request, "teacher-membership");
    const seededItem = await seedStoreItem(
      request,
      seededClass.teacher.accessToken,
      seededClass.classId,
      "Members Only Item"
    );
    const seededJob = await seedJob(
      request,
      seededClass.teacher.accessToken,
      seededClass.classId,
      "Members Only Job"
    );

    const outsider = await seedAuthPersona(request, "student-outsider", "STUDENT");

    await expectGraphQLError(
      gql(
        request,
        MAKE_PURCHASE_MUTATION,
        {
          input: {
            classId: seededClass.classId,
            items: [{ storeItemId: seededItem.createStoreItem.id, quantity: 1 }],
          },
        },
        outsider.accessToken
      ),
      "Account not found for this class"
    );

    await expectGraphQLError(
      gql(
        request,
        APPLY_FOR_JOB_MUTATION,
        {
          input: {
            jobId: seededJob.createJob.id,
            applicationText: "I should not be able to apply.",
          },
        },
        outsider.accessToken
      ),
      "must be a student in this class"
    );
  });
});
