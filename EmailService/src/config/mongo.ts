/**
 * MongoDB Connection Configuration
 * Connects to MongoDB with database name: email_service
 */

import mongoose from 'mongoose';
import { env } from './env';
import { dbLogger } from './logger';

let isConnected = false;

export const connectMongo = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    dbLogger.debug('Using existing MongoDB connection');
    return mongoose;
  }

  try {
    dbLogger.info({ dbName: env.MONGODB_DB_NAME }, 'Connecting to MongoDB...');

    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB_NAME,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    });

    isConnected = true;

    mongoose.connection.on('error', (err) => {
      dbLogger.error({ err }, 'MongoDB connection error');
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      dbLogger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      dbLogger.info('MongoDB reconnected');
      isConnected = true;
    });

    dbLogger.info({
      dbName: env.MONGODB_DB_NAME,
      host: connection.connection.host,
    }, 'MongoDB connected successfully');

    return connection;
  } catch (error) {
    dbLogger.error({ error }, 'Failed to connect to MongoDB');
    throw error;
  }
};

export const disconnectMongo = async (): Promise<void> => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    dbLogger.info('MongoDB disconnected');
  } catch (error) {
    dbLogger.error({ error }, 'Error disconnecting from MongoDB');
    throw error;
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  dbLogger.info(`Received ${signal}. Closing MongoDB connection...`);
  await disconnectMongo();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
