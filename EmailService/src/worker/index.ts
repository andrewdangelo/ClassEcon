/**
 * Worker Entrypoint
 * Standalone process for processing email delivery jobs
 */

import { connectMongo, workerLogger } from '../config';
import { startWorker, stopWorker } from './processor';

const main = async () => {
  workerLogger.info('Email Service Worker starting...');

  try {
    // Connect to MongoDB
    await connectMongo();

    // Start processing
    await startWorker();
  } catch (error) {
    workerLogger.error({ error }, 'Worker failed to start');
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  workerLogger.info(`Received ${signal}. Shutting down worker...`);
  stopWorker();
  
  // Give worker time to finish current jobs
  await new Promise((resolve) => setTimeout(resolve, 5000));
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  workerLogger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  workerLogger.fatal({ reason }, 'Unhandled rejection');
  process.exit(1);
});

// Start
main();
