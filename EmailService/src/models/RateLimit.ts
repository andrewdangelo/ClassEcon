/**
 * RateLimit Model
 * MongoDB-backed rate limiting with TTL auto-cleanup
 */

import { Schema, model, Document } from 'mongoose';

export interface IRateLimit extends Document {
  key: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    resetAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: 'rate_limits',
  }
);

// Indexes
RateLimitSchema.index({ key: 1 }, { unique: true });
// TTL index - automatically cleans up expired rate limit entries
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit = model<IRateLimit>('RateLimit', RateLimitSchema);
