import { test } from "@playwright/test";
import { expectGraphQLError } from "../../support/assertions";
import { gql } from "../../support/graphql-client";
import {
  seedAuthPersona,
  seedJob,
  seedJobApplication,
  seedTeacherClass,
} from "../../support/fixtures";

const APPROVE_JOB_APPLICATION_MUTATION = `
  mutation ApproveJobApplication($id: ID!) {
    approveJobApplication(id: $id) { id status }
  }
`;

test.describe("API cross-class and role denials", () => {
  test("teacher from different class and student cannot approve applications", async ({ request }) => {
    const classA = await seedTeacherClass(request, "teacher-class-a");
    const classB = await seedTeacherClass(request, "teacher-class-b");
    const studentA = await seedAuthPersona(request, "student-class-a", "STUDENT", classA.joinCode);

    const job = await seedJob(request, classA.teacher.accessToken, classA.classId, "Cross Class Job");
    const application = await seedJobApplication(request, studentA.accessToken, job.createJob.id);

    await expectGraphQLError(
      gql(
        request,
        APPROVE_JOB_APPLICATION_MUTATION,
        { id: application.applyForJob.id },
        classB.teacher.accessToken
      ),
      "Forbidden"
    );

    await expectGraphQLError(
      gql(
        request,
        APPROVE_JOB_APPLICATION_MUTATION,
        { id: application.applyForJob.id },
        studentA.accessToken
      ),
      "Forbidden"
    );
  });
});
