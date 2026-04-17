import { test } from "@playwright/test";
import { expectGraphQLError } from "../../support/assertions";
import { gql } from "../../support/graphql-client";
import { seedAuthPersona, seedTeacherClass } from "../../support/fixtures";

const CREATE_CLASS_MUTATION = `
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) { id }
  }
`;

const CREATE_STORE_ITEM_MUTATION = `
  mutation CreateStoreItem($input: CreateStoreItemInput!) {
    createStoreItem(input: $input) { id }
  }
`;

const CREATE_JOB_MUTATION = `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) { id }
  }
`;

test.describe("API role permission matrix", () => {
  test("student cannot execute teacher-only mutations", async ({ request }) => {
    const seeded = await seedTeacherClass(request, "teacher-api-role");
    const student = await seedAuthPersona(
      request,
      "student-api-role",
      "STUDENT",
      seeded.joinCode
    );

    await expectGraphQLError(
      gql(
        request,
        CREATE_CLASS_MUTATION,
        { input: { name: "Forbidden Class", subject: "Science", period: "Fall" } },
        student.accessToken
      ),
      "Forbidden"
    );

    await expectGraphQLError(
      gql(
        request,
        CREATE_STORE_ITEM_MUTATION,
        { input: { classId: seeded.classId, title: "Teacher Only Item", price: 50 } },
        student.accessToken
      ),
      "Forbidden"
    );

    await expectGraphQLError(
      gql(
        request,
        CREATE_JOB_MUTATION,
        {
          input: {
            classId: seeded.classId,
            title: "Teacher Only Job",
            salary: 20,
            period: "WEEKLY",
            maxCapacity: 1,
          },
        },
        student.accessToken
      ),
      "Forbidden"
    );
  });
});
