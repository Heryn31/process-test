import Queue from 'bull';

const REDIS_HOST = '127.0.0.1';
const REDIS_PORT = 6379;

interface JobData {
  userIds: string[];
  batchId: string;
}

export const documentQueue = new Queue<JobData>('document-queue', {
  redis: { host: REDIS_HOST, port: REDIS_PORT }
});