import { gql } from "@apollo/client";

export const STUDENT_DETAILS = gql`
  query StudentDetails($studentId: ID!, $classId: ID!) {
    account(studentId: $studentId, classId: $classId) {
      id
      balance
      studentId
      classId
    }
    studentBackpack(studentId: $studentId, classId: $classId) {
      id
      studentId
      classId
      storeItemId
      unitPrice
      total
      quantity
      createdAt
      status
      redemptionDate
      redemptionNote
      storeItem {
        id
        title
        description
        price
        imageUrl
      }
    }
    purchaseHistory(studentId: $studentId, classId: $classId) {
      id
      studentId
      classId
      storeItemId
      unitPrice
      total
      quantity
      createdAt
      status
      redemptionDate
      redemptionNote
      storeItem {
        id
        title
        description
        price
        imageUrl
      }
    }
  }
`;

export const STUDENT_TRANSACTIONS = gql`
  query StudentTransactions($accountId: ID!) {
    transactionsByAccount(accountId: $accountId) {
      id
      accountId
      amount
      type
      memo
      createdAt
    }
  }
`;
