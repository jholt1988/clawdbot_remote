import 'dotenv/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export const connection = new IORedis(process.env.REDIS_URL);
export const executionQueue = new Queue('execution-queue', { connection });
