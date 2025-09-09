import { gql } from "@apollo/client";

export const ACCOUNT = gql`
  query Account($studentId: ID!, $classId: ID!) {
    account(studentId: $studentId, classId: $classId) {
      id
      studentId
      classId
      balance
    }
  }
`;

export const TRANSACTIONS_BY_ACCOUNT = gql`
  query TransactionsByAccount($accountId: ID!) {
    transactionsByAccount(accountId: $accountId) {
      id
      type
      amount
      memo
      createdAt
    }
  }
`;
