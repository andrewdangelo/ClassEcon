// src/graphql/requests.ts
import { gql } from "@apollo/client";

export const PAY_REQUESTS_BY_STUDENT = gql`
  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {
    payRequestsByStudent(classId: $classId, studentId: $studentId) {
      id
      amount
      reason
      justification
      status
      teacherComment
      createdAt
    }
  }
`;

export const PAY_REQUESTS_BY_CLASS = gql`
  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {
    payRequestsByClass(classId: $classId, status: $status) {
      id
      student {
        id
        name
      }
      amount
      reason
      justification
      status
      teacherComment
      createdAt
    }
  }
`;
