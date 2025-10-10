import { gql } from "@apollo/client";

export const CREATE_REDEMPTION_REQUEST = gql`
  mutation CreateRedemptionRequest($purchaseId: ID!, $studentNote: String) {
    createRedemptionRequest(purchaseId: $purchaseId, studentNote: $studentNote) {
      id
      purchaseId
      studentId
      classId
      status
      studentNote
      createdAt
    }
  }
`;

export const APPROVE_REDEMPTION = gql`
  mutation ApproveRedemption($id: ID!, $teacherComment: String!) {
    approveRedemption(id: $id, teacherComment: $teacherComment) {
      id
      purchaseId
      studentId
      classId
      status
      studentNote
      teacherComment
      reviewedByUserId
      reviewedAt
      createdAt
    }
  }
`;

export const DENY_REDEMPTION = gql`
  mutation DenyRedemption($id: ID!, $teacherComment: String!) {
    denyRedemption(id: $id, teacherComment: $teacherComment) {
      id
      purchaseId
      studentId
      classId
      status
      studentNote
      teacherComment
      reviewedByUserId
      reviewedAt
      createdAt
    }
  }
`;
