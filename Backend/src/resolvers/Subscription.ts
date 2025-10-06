import { withFilter } from 'graphql-subscriptions';
import { pubsub, PAY_REQUEST_EVENTS } from '../pubsub';

export const Subscription = {
  payRequestCreated: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_CREATED),
      (payload: any, variables: any) => {
        return payload.payRequestCreated.classId === variables.classId;
      }
    ),
  },

  payRequestUpdated: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_UPDATED),
      (payload: any, variables: any) => {
        return payload.payRequestUpdated.classId === variables.classId;
      }
    ),
  },

  payRequestStatusChanged: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_STATUS_CHANGED),
      (payload: any, variables: any) => {
        return payload.payRequestStatusChanged.classId === variables.classId;
      }
    ),
  },

  payRequestCommentAdded: {
    subscribe: withFilter(
      () => (pubsub as any).asyncIterator(PAY_REQUEST_EVENTS.PAY_REQUEST_COMMENT_ADDED),
      (payload: any, variables: any) => {
        return payload.payRequestCommentAdded.payRequestId === variables.payRequestId;
      }
    ),
  },
};
