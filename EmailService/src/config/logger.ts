/**
 * Pino Logger Configuration
 * Structured logging for production use
 */

import pino from 'pino';
import { env } from './env';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: 'email-service',
    env: env.NODE_ENV,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

// Child loggers for different components
export const dbLogger = logger.child({ component: 'database' });
export const workerLogger = logger.child({ component: 'worker' });
export const webhookLogger = logger.child({ component: 'webhook' });
export const authLogger = logger.child({ component: 'auth' });
export const campaignLogger = logger.child({ component: 'campaign' });
