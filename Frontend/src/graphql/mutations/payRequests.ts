import { gql } from "@apollo/client"

export const CREATE_PAY_REQUEST = gql`
  mutation CreatePayRequest($input: CreatePayRequestInput!) {
    createPayRequest(input: $input) {
      id
      status
      amount
      reason
      justification
      createdAt
    }
  }
`

export const APPROVE_PAY_REQUEST = gql`
  mutation ApprovePayRequest($id: ID!, $amount: Int!, $comment: String) {
    approvePayRequest(id: $id, amount: $amount, comment: $comment) {
      id
      status
      amount
      teacherComment
    }
  }
`

export const SUBMIT_PAY_REQUEST = gql`
  mutation SubmitPayRequest($id: ID!) {
    submitPayRequest(id: $id) {
      id
      status
    }
  }
`

export const REBUKE_PAY_REQUEST = gql`
  mutation RebukePayRequest($id: ID!, $comment: String!) {
    rebukePayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
    }
  }
`

export const DENY_PAY_REQUEST = gql`
  mutation DenyPayRequest($id: ID!, $comment: String!) {
    denyPayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
    }
  }
`

export const ADD_PAY_REQUEST_COMMENT = gql`
  mutation AddPayRequestComment($payRequestId: ID!, $content: String!) {
    addPayRequestComment(payRequestId: $payRequestId, content: $content) {
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
