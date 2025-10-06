import { gql } from "@apollo/client"

export const PAY_REQUEST_CREATED = gql`
  subscription PayRequestCreated($classId: ID!) {
    payRequestCreated(classId: $classId) {
      id
      student {
        id
        name
      }
      amount
      reason
      justification
      status
      createdAt
    }
  }
`

export const PAY_REQUEST_STATUS_CHANGED = gql`
  subscription PayRequestStatusChanged($classId: ID!) {
    payRequestStatusChanged(classId: $classId) {
      id
      status
      amount
      teacherComment
    }
  }
`

export const PAY_REQUEST_COMMENT_ADDED = gql`
  subscription PayRequestCommentAdded($payRequestId: ID!) {
    payRequestCommentAdded(payRequestId: $payRequestId) {
      id
      content
      user {
        id
        name
      }
      createdAt
    }
  }
`
