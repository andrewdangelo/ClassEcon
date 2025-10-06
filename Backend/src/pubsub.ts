import { PubSub } from 'graphql-subscriptions';

export const pubsub = new PubSub();

// Subscription event names
export const PAY_REQUEST_EVENTS = {
  PAY_REQUEST_CREATED: 'PAY_REQUEST_CREATED',
  PAY_REQUEST_UPDATED: 'PAY_REQUEST_UPDATED',
  PAY_REQUEST_STATUS_CHANGED: 'PAY_REQUEST_STATUS_CHANGED',
  PAY_REQUEST_COMMENT_ADDED: 'PAY_REQUEST_COMMENT_ADDED',
} as const;
