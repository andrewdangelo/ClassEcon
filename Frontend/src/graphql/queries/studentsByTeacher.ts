import { gql } from "@apollo/client";

export const STUDENTS_BY_TEACHER = gql`
  query StudentsByTeacher {
    studentsByTeacher {
      id
      name
      balance
      classId
      class {
        id
        name
        subject
        period
      }
    }
  }
`;
