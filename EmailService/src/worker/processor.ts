/**
 * Worker Processor
 * Polls MongoDB for queued jobs and sends emails (SMTP or Resend)
 * Uses atomic claiming to prevent duplicate sends
 */

import { DeliveryJob, type IDeliveryJob } from '../models';
import { sendEmail } from '../config/mailer';
import { env, workerLogger } from '../config';
import { updateCampaignStatusFromJobs } from '../services/campaign';
import crypto from 'crypto';

// Worker instance ID for lock identification
const WORKER_ID = `worker-${crypto.randomBytes(4).toString('hex')}`;

// Lock timeout in milliseconds (5 minutes)
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;

// Backoff delays in milliseconds
const BACKOFF_DELAYS = [
  1 * 60 * 1000,   // 1 minute
  5 * 60 * 1000,   // 5 minutes
  15 * 60 * 1000,  // 15 minutes
  60 * 60 * 1000,  // 1 hour
  60 * 60 * 1000,  // 1 hour (final)
];

// Rate limiting state
let sendCount = 0;
let lastSendReset = Date.now();

/**
 * Check and reset rate limiter
 */
const checkRateLimit = (): boolean => {
  const now = Date.now();
  
  // Reset counter every second
  if (now - lastSendReset >= 1000) {
    sendCount = 0;
    lastSendReset = now;
  }

  // Check if under limit
  if (sendCount >= env.WORKER_SENDS_PER_SECOND) {
    return false;
  }

  sendCount++;
  return true;
};

/**
 * Wait for rate limit slot
 */
const waitForRateLimit = async (): Promise<void> => {
  while (!checkRateLimit()) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

/**
 * Recover stale locks (from crashed workers)
 */
const recoverStaleLocks = async (): Promise<number> => {
  const staleTime = new Date(Date.now() - LOCK_TIMEOUT_MS);

  const result = await DeliveryJob.updateMany(
    {
      status: 'SENDING',
      lockedAt: { $lt: staleTime },
    },
    {
      $set: {
        status: 'RETRY',
        lockedAt: null,
        lockedBy: null,
        scheduledAt: new Date(),
      },
      $inc: { attempts: 1 },
    }
  );

  if (result.modifiedCount > 0) {
    workerLogger.info(
      { count: result.modifiedCount },
      'Recovered stale locked jobs'
    );
  }

  return result.modifiedCount;
};

/**
 * Claim a job atomically
 */
const claimJob = async (): Promise<IDeliveryJob | null> => {
  const now = new Date();

  // Find and claim a job atomically
  const job = await DeliveryJob.findOneAndUpdate(
    {
      status: { $in: ['QUEUED', 'RETRY'] },
      scheduledAt: { $lte: now },
      $or: [
        { lockedAt: null },
        { lockedAt: { $lt: new Date(Date.now() - LOCK_TIMEOUT_MS) } },
      ],
    },
    {
      $set: {
        status: 'SENDING',
        lockedAt: now,
        lockedBy: WORKER_ID,
      },
    },
    {
      new: true,
      sort: { scheduledAt: 1 }, // Process oldest first
    }
  );

  return job;
};

/**
 * Process a single job
 */
const processJob = async (job: IDeliveryJob): Promise<void> => {
  workerLogger.debug(
    { jobId: job._id, toEmail: job.toEmail, type: job.type },
    'Processing job'
  );

  try {
    // Wait for rate limit slot
    await waitForRateLimit();

    // Send email (SMTP or Resend)
    const result = await sendEmail({
      to: job.toEmail,
      from: job.fromEmail,
      subject: job.subject,
      html: job.html,
      text: job.text || undefined,
    });

    if (result.success) {
      // Mark as sent
      await DeliveryJob.updateOne(
        { _id: job._id },
        {
          $set: {
            status: 'SENT',
            sentAt: new Date(),
            providerMessageId: result.messageId || null,
            lockedAt: null,
            lockedBy: null,
          },
        }
      );

      workerLogger.info(
        { jobId: job._id, toEmail: job.toEmail, messageId: result.messageId },
        'Job completed successfully'
      );

      // Update campaign status if this was a campaign job
      if (job.campaignId) {
        // Don't await - update asynchronously
        updateCampaignStatusFromJobs(job.campaignId.toString()).catch((err) => {
          workerLogger.error({ err, campaignId: job.campaignId }, 'Failed to update campaign status');
        });
      }
    } else {
      // Handle failure
      await handleJobFailure(job, result.error || 'Unknown error');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await handleJobFailure(job, errorMessage);
  }
};

/**
 * Handle job failure with retry logic
 */
const handleJobFailure = async (job: IDeliveryJob, error: string): Promise<void> => {
  const attempts = job.attempts + 1;

  if (attempts < env.WORKER_MAX_ATTEMPTS) {
    // Schedule retry with backoff
    const backoffIndex = Math.min(attempts - 1, BACKOFF_DELAYS.length - 1);
    const backoffMs = BACKOFF_DELAYS[backoffIndex];
    const scheduledAt = new Date(Date.now() + backoffMs);

    await DeliveryJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status: 'RETRY',
          scheduledAt,
          lastError: error,
          lockedAt: null,
          lockedBy: null,
        },
        $inc: { attempts: 1 },
      }
    );

    workerLogger.warn(
      {
        jobId: job._id,
        toEmail: job.toEmail,
        attempts,
        nextRetry: scheduledAt,
        error,
      },
      'Job failed, scheduled for retry'
    );
  } else {
    // Max attempts reached - mark as failed
    await DeliveryJob.updateOne(
      { _id: job._id },
      {
        $set: {
          status: 'FAILED',
          lastError: error,
          lockedAt: null,
          lockedBy: null,
        },
        $inc: { attempts: 1 },
      }
    );

    workerLogger.error(
      { jobId: job._id, toEmail: job.toEmail, attempts, error },
      'Job failed permanently'
    );

    // Update campaign status if this was a campaign job
    if (job.campaignId) {
      updateCampaignStatusFromJobs(job.campaignId.toString()).catch((err) => {
        workerLogger.error({ err, campaignId: job.campaignId }, 'Failed to update campaign status');
      });
    }
  }
};

/**
 * Process batch of jobs
 */
const processBatch = async (): Promise<number> => {
  let processed = 0;
  const concurrency = env.WORKER_CONCURRENCY;
  const promises: Promise<void>[] = [];

  for (let i = 0; i < concurrency; i++) {
    const job = await claimJob();
    if (!job) break;

    promises.push(processJob(job));
    processed++;
  }

  await Promise.all(promises);
  return processed;
};

// State
let isRunning = false;
let shouldStop = false;

/**
 * Start the worker
 */
export const startWorker = async (): Promise<void> => {
  if (isRunning) {
    workerLogger.warn('Worker is already running');
    return;
  }

  isRunning = true;
  shouldStop = false;

  workerLogger.info(
    {
      workerId: WORKER_ID,
      concurrency: env.WORKER_CONCURRENCY,
      maxAttempts: env.WORKER_MAX_ATTEMPTS,
      sendsPerSecond: env.WORKER_SENDS_PER_SECOND,
      pollInterval: env.WORKER_POLL_INTERVAL_MS,
    },
    'Worker started'
  );

  // Initial stale lock recovery
  await recoverStaleLocks();

  // Main loop
  while (!shouldStop) {
    try {
      // Periodically recover stale locks
      if (Math.random() < 0.01) {
        await recoverStaleLocks();
      }

      // Process batch
      const processed = await processBatch();

      // If no jobs, wait before polling again
      if (processed === 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, env.WORKER_POLL_INTERVAL_MS)
        );
      }
    } catch (error) {
      workerLogger.error({ error }, 'Worker loop error');
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  isRunning = false;
  workerLogger.info('Worker stopped');
};

/**
 * Stop the worker gracefully
 */
export const stopWorker = (): void => {
  workerLogger.info('Stopping worker...');
  shouldStop = true;
};

/**
 * Check if worker is running
 */
export const isWorkerRunning = (): boolean => isRunning;
