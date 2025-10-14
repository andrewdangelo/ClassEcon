import { gql } from "@apollo/client";

export const FINES_BY_CLASS = gql`
  query FinesByClass($classId: ID!, $status: FineStatus) {
    finesByClass(classId: $classId, status: $status) {
      id
      studentId
      student {
        id
        name
        email
      }
      classId
      teacherId
      teacher {
        id
        name
      }
      amount
      reason
      description
      transactionId
      status
      waivedReason
      waivedAt
      waivedByUserId
      createdAt
      updatedAt
    }
  }
`;

export const FINES_BY_STUDENT = gql`
  query FinesByStudent($studentId: ID!, $classId: ID!) {
    finesByStudent(studentId: $studentId, classId: $classId) {
      id
      studentId
      classId
      teacherId
      teacher {
        id
        name
      }
      amount
      reason
      description
      transactionId
      status
      waivedReason
      waivedAt
      waivedByUserId
      createdAt
      updatedAt
    }
  }
`;

export const FINE = gql`
  query Fine($id: ID!) {
    fine(id: $id) {
      id
      studentId
      student {
        id
        name
        email
      }
      classId
      teacherId
      teacher {
        id
        name
      }
      amount
      reason
      description
      transactionId
      transaction {
        id
        type
        amount
        memo
        createdAt
      }
      status
      waivedReason
      waivedAt
      waivedByUserId
      waivedBy {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;
