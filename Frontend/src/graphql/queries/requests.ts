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

/** 🔻 Mutations added to match backend */
export const CREATE_PAY_REQUEST = gql`
  mutation CreatePayRequest($input: CreatePayRequestInput!) {
    createPayRequest(input: $input) {
      id
      classId
      studentId
      amount
      reason
      justification
      status
      createdAt
    }
  }
`;

export const APPROVE_PAY_REQUEST = gql`
  mutation ApprovePayRequest($id: ID!, $comment: String) {
    approvePayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
      updatedAt
    }
  }
`;

export const SUBMIT_PAY_REQUEST = gql`
  mutation SubmitPayRequest($id: ID!) {
    submitPayRequest(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const REBUKE_PAY_REQUEST = gql`
  mutation RebukePayRequest($id: ID!, $comment: String!) {
    rebukePayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
      updatedAt
    }
  }
`;

export const DENY_PAY_REQUEST = gql`
  mutation DenyPayRequest($id: ID!, $comment: String) {
    denyPayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
      updatedAt
    }
  }
`;
