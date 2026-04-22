import { test } from "@playwright/test";
import { expectGraphQLError } from "../../support/assertions";
import { gql } from "../../support/graphql-client";
import { seedTeacherClassWithStudent, seedStoreItem } from "../../support/fixtures";
import { testRunId } from "../../support/test-data";

const ISSUE_FINE_MUTATION = `
  mutation IssueFine($input: IssueFineInput!) {
    issueFine(input: $input) { id }
  }
`;

const FINES_BY_CLASS_QUERY = `
  query FinesByClass($classId: ID!) {
    finesByClass(classId: $classId) { id }
  }
`;

const CLASS_STATISTICS_QUERY = `
  query ClassStatistics($classId: ID!) {
    classStatistics(classId: $classId) { totalStudents }
  }
`;

const REDEMPTION_REQUESTS_QUERY = `
  query RedemptionRequests($classId: ID!) {
    redemptionRequests(classId: $classId) { id }
  }
`;

const UPDATE_STORE_ITEM_MUTATION = `
  mutation UpdateStoreItem($id: ID!, $input: UpdateStoreItemInput!) {
    updateStoreItem(id: $id, input: $input) { id }
  }
`;

const CREATE_BETA_CODE_MUTATION = `
  mutation CreateBetaCode($code: String!, $description: String) {
    createBetaCode(code: $code, description: $description) { id }
  }
`;

test.describe("API permissions: fines, redemptions, store, analytics", () => {
  test("student cannot issue fines or query finesByClass", async ({ request }) => {
    const seeded = await seedTeacherClassWithStudent(
      request,
      "teacher-api-fines",
      "student-api-fines"
    );

    await expectGraphQLError(
      gql(
        request,
        ISSUE_FINE_MUTATION,
        {
          input: {
            studentId: seeded.student.user.id,
            classId: seeded.classId,
            amount: 5,
            reason: "Test fine",
          },
        },
        seeded.student.accessToken
      ),
      "Forbidden"
    );

    await expectGraphQLError(
      gql(request, FINES_BY_CLASS_QUERY, { classId: seeded.classId }, seeded.student.accessToken),
      "Forbidden"
    );
  });

  test("student cannot access teacher analytics or redemption queue", async ({ request }) => {
    const seeded = await seedTeacherClassWithStudent(
      request,
      "teacher-api-analytics",
      "student-api-analytics"
    );

    await expectGraphQLError(
      gql(
        request,
        CLASS_STATISTICS_QUERY,
        { classId: seeded.classId },
        seeded.student.accessToken
      ),
      "Forbidden"
    );

    await expectGraphQLError(
      gql(
        request,
        REDEMPTION_REQUESTS_QUERY,
        { classId: seeded.classId },
        seeded.student.accessToken
      ),
      "Forbidden"
    );
  });

  test("student cannot update store items", async ({ request }) => {
    const seeded = await seedTeacherClassWithStudent(
      request,
      "teacher-api-store",
      "student-api-store"
    );
    const item = await seedStoreItem(request, seeded.teacher.accessToken, seeded.classId, "API Item");

    await expectGraphQLError(
      gql(
        request,
        UPDATE_STORE_ITEM_MUTATION,
        { id: item.createStoreItem.id, input: { title: "Hacked", price: 1 } },
        seeded.student.accessToken
      ),
      "Forbidden"
    );
  });

  test("student cannot create beta codes", async ({ request }) => {
    const seeded = await seedTeacherClassWithStudent(
      request,
      "teacher-api-beta",
      "student-api-beta"
    );

    await expectGraphQLError(
      gql(
        request,
        CREATE_BETA_CODE_MUTATION,
        { code: `E2ENO${testRunId}`, description: "nope" },
        seeded.student.accessToken
      ),
      "Forbidden"
    );

    await gql(
      request,
      CREATE_BETA_CODE_MUTATION,
      { code: `E2EYES${testRunId}`, description: "teacher ok" },
      seeded.teacher.accessToken
    );
  });
});
