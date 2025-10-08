import { gql } from "@apollo/client";

export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived($userId: ID!) {
    notificationReceived(userId: $userId) {
      id
      userId
      type
      title
      message
      relatedId
      relatedType
      isRead
      createdAt
      updatedAt
    }
  }
`;
