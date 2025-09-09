// src/graphql/students.ts
import { gql } from "@apollo/client";

export const STUDENTS_BY_CLASS = gql`
  query StudentsByClass($classId: ID!) {
    studentsByClass(classId: $classId) {
      id
      name
      classId
      balance
    }
  }
`;

// Optional: teacher-only directory
export const STUDENTS_DIRECTORY = gql`
  query StudentsDirectory(
    $filter: StudentsFilter
    $limit: Int = 50
    $offset: Int = 0
  ) {
    students(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        id
        name
        email
        role
        status
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;
