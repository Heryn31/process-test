import Queue from 'bull';
import { randomUUID } from 'crypto';

interface JobData {
  userIds: string[];
  batchId: string;
}

export const documentQueue = new Queue<JobData>('document-queue', {
  redis: { host: '127.0.0.1', port: 6379 }
});

// Worker
documentQueue.process(async (job) => {
  console.log(`Processing batch ${job.data.batchId}`);

  for (const userId of job.data.userIds) {
    // ici on génères le PDF
    await new Promise(res => setTimeout(res, 20));
    console.log(`PDF generated for ${userId}`);
  }

  return { message: 'Batch completed' };
});