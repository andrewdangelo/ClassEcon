import { gql } from "@apollo/client";

export const ISSUE_FINE = gql`
  mutation IssueFine($input: IssueFineInput!) {
    issueFine(input: $input) {
      id
      studentId
      student {
        id
        name
      }
      classId
      teacherId
      amount
      reason
      description
      transactionId
      status
      createdAt
      updatedAt
    }
  }
`;

export const WAIVE_FINE = gql`
  mutation WaiveFine($id: ID!, $reason: String!) {
    waiveFine(id: $id, reason: $reason) {
      id
      studentId
      classId
      teacherId
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

export const DELETE_FINE = gql`
  mutation DeleteFine($id: ID!) {
    deleteFine(id: $id)
  }
`;
