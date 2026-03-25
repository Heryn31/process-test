import Queue from 'bull';
import { JobData } from '../types';
import { IQueue } from './IQueue';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

export const documentQueue = new Queue<JobData>('document-queue', {
  redis: { host: REDIS_HOST, port: REDIS_PORT }
});

export const bullQueue : IQueue<any> = documentQueue;