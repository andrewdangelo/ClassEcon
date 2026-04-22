/**
 * Email Service API Server
 * GraphQL API + Webhook endpoints
 */

import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFileSync } from 'fs';
import { join } from 'path';

import { env, connectMongo, logger, getMailTransport } from '../config';
import { createContext } from '../graphql/context';
import { resolvers } from '../graphql/resolvers';
import { webhookRouter } from '../webhooks/resendWebhook';

const main = async () => {
  logger.info('Email Service starting...');

  // Create Express app
  const app = express();
  // Cloudflare Containers terminates TLS upstream; trust forwarded headers.
  app.set('trust proxy', 1);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'email-service',
      timestamp: new Date().toISOString(),
    });
  });

  // Webhook routes (must be before GraphQL)
  app.use('/webhooks', webhookRouter);

  // Load GraphQL schema
  const typeDefs = readFileSync(
    join(__dirname, '../graphql/schema.graphql'),
    'utf-8'
  );

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: env.NODE_ENV === 'development',
    formatError: (error) => {
      logger.error({ error }, 'GraphQL error');

      // Hide internal errors in production
      if (env.NODE_ENV === 'production') {
        if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
          return {
            message: 'An internal error occurred',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          };
        }
      }

      return error;
    },
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply GraphQL middleware
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error({ error: err }, 'Express error');
    res.status(500).json({ error: 'Internal server error' });
  });

  // Start server first so the TCP port opens immediately (Cloudflare
  // Containers routes traffic only once the port is listening), then
  // connect to Mongo in the background.
  const port = parseInt(env.PORT, 10);
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Server running on http://0.0.0.0:${port}`);
    logger.info(`GraphQL endpoint: http://0.0.0.0:${port}/graphql`);
    logger.info(`Health check: http://0.0.0.0:${port}/health`);
    logger.info(`Webhook endpoint: http://0.0.0.0:${port}/webhooks/resend`);
    logger.info({ transport: getMailTransport() }, 'Outbound email transport');
  });

  connectMongo()
    .then(() => logger.info('MongoDB connected'))
    .catch((error) => logger.error({ error }, 'MongoDB connection failed'));
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start
main().catch((error) => {
  logger.fatal({ error }, 'Failed to start server');
  process.exit(1);
});
