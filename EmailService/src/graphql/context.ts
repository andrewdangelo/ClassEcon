/**
 * GraphQL Context
 * Contains auth info and utilities for resolvers
 */

import { Request } from 'express';
import { env, logger } from '../config';

export interface GraphQLContext {
  req: Request;
  isAdmin: boolean;
  isService: boolean;
  clientIp: string | undefined;
}

/**
 * Create context for each GraphQL request
 */
export const createContext = async ({ req }: { req: Request }): Promise<GraphQLContext> => {
  const adminToken = req.headers['x-admin-token'] as string | undefined;
  const serviceToken = req.headers['x-service-token'] as string | undefined;

  // Check admin authentication
  const isAdmin = adminToken === env.ADMIN_TOKEN;

  // Check service authentication (backend-to-backend)
  const isService = serviceToken === env.SERVICE_TOKEN;

  // Extract client IP (handle proxies)
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress;

  if (isAdmin) {
    logger.debug({ clientIp }, 'Admin request authenticated');
  }

  if (isService) {
    logger.debug({ clientIp }, 'Service request authenticated');
  }

  return {
    req,
    isAdmin,
    isService,
    clientIp,
  };
};

/**
 * Require admin authentication
 */
export const requireAdmin = (ctx: GraphQLContext): void => {
  if (!ctx.isAdmin) {
    throw new Error('Admin authentication required');
  }
};

/**
 * Require service authentication
 */
export const requireService = (ctx: GraphQLContext): void => {
  if (!ctx.isService && !ctx.isAdmin) {
    throw new Error('Service authentication required');
  }
};

/**
 * Require any authentication (admin or service)
 */
export const requireAuth = (ctx: GraphQLContext): void => {
  if (!ctx.isAdmin && !ctx.isService) {
    throw new Error('Authentication required');
  }
};
