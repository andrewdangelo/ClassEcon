import { withFilter } from 'graphql-subscriptions';
import { pubsub, PAY_REQUEST_EVENTS } from '../pubsub';
import { NOTIFICATION_EVENTS } from '../services/notifications';

export const Subscription = {
  payRequestCreated: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_CREATED),
      (payload, variables) => {
        return !!(payload?.payRequestCreated?.classId === variables.classId);
      }
    ),
    resolve: (payload: any) => payload.payRequestCreated,
  },

  payRequestUpdated: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_UPDATED),
      (payload, variables) => {
        return !!(payload?.payRequestUpdated?.classId === variables.classId);
      }
    ),
    resolve: (payload: any) => payload.payRequestUpdated,
  },

  payRequestStatusChanged: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_STATUS_CHANGED),
      (payload, variables) => {
        return !!(payload?.payRequestStatusChanged?.classId === variables.classId);
      }
    ),
    resolve: (payload: any) => payload.payRequestStatusChanged,
  },

  payRequestCommentAdded: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_COMMENT_ADDED),
      (payload, variables) => {
        return !!(payload?.payRequestCommentAdded?.payRequestId === variables.payRequestId);
      }
    ),
    resolve: (payload: any) => payload.payRequestCommentAdded,
  },

  notificationReceived: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(NOTIFICATION_EVENTS.NOTIFICATION_RECEIVED),
      (payload, variables) => {
        // Only pass through if payload has notification data
        if (!payload?.notificationReceived) {
          return false;
        }
        const matches = payload.notificationReceived.userId?.toString() === variables.userId;
        console.log('Notification subscription filter:', { 
          payloadUserId: payload.notificationReceived.userId?.toString(), 
          variablesUserId: variables.userId,
          matches 
        });
        return matches;
      }
    ),
    resolve: (payload: any) => {
      console.log('Notification subscription resolve:', payload?.notificationReceived || payload);
      return payload.notificationReceived;
    },
  },
};
