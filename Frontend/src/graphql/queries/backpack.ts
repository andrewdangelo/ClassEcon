import { gql } from "@apollo/client";

export const STUDENT_BACKPACK = gql`
  query StudentBackpack($studentId: ID!, $classId: ID!) {
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
  }
`;

export const PURCHASE_HISTORY = gql`
  query PurchaseHistory($studentId: ID!, $classId: ID!) {
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

export const REDEMPTION_REQUESTS = gql`
  query RedemptionRequests($classId: ID!, $status: RedemptionStatus) {
    redemptionRequests(classId: $classId, status: $status) {
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
      purchase {
        id
        unitPrice
        total
        quantity
        createdAt
        storeItem {
          id
          title
          description
          imageUrl
        }
      }
      student {
        id
        name
        email
      }
      reviewedBy {
        id
        name
        email
      }
    }
  }
`;

export const REDEMPTION_REQUEST = gql`
  query RedemptionRequest($id: ID!) {
    redemptionRequest(id: $id) {
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
      purchase {
        id
        unitPrice
        total
        quantity
        createdAt
        storeItem {
          id
          title
          description
          price
          imageUrl
        }
      }
      student {
        id
        name
        email
      }
      reviewedBy {
        id
        name
        email
      }
    }
  }
`;
