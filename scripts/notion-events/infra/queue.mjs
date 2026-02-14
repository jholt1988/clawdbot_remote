import 'dotenv/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// BullMQ requires ioredis `maxRetriesPerRequest` to be null for blocking commands.
export const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const executionQueue = new Queue('execution-queue', { connection });
