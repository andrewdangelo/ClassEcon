/**
 * AuthToken Model
 * Stores hashed OTP and password reset tokens with TTL auto-deletion
 */

import { Schema, model, Document, Types } from 'mongoose';

export type TokenPurpose = 'EMAIL_2FA' | 'PASSWORD_RESET';

export interface IAuthToken extends Document {
  _id: Types.ObjectId;
  userId: string;
  email: string;
  purpose: TokenPurpose;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  attemptCount: number;
  meta: Record<string, unknown> | null;
  createdAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    purpose: {
      type: String,
      enum: ['EMAIL_2FA', 'PASSWORD_RESET'],
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'auth_tokens',
  }
);

// TTL index - automatically deletes documents after expiresAt
// IMPORTANT: TTL will delete documents after expiry automatically
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Lookup index for finding tokens
AuthTokenSchema.index({ email: 1, purpose: 1, createdAt: -1 });
AuthTokenSchema.index({ userId: 1 });

export const AuthToken = model<IAuthToken>('AuthToken', AuthTokenSchema);
