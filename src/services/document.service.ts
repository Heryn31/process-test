import { batches, documents } from '../db';
import { randomUUID } from 'crypto';

export const createBatch = (userIds: string[]) => {
  const batchId = randomUUID();

  batches[batchId] = {
    status: 'pending',
    documents: []
  };

  // Lancer traitement async (non bloquant)
  processBatch(batchId, userIds);

  return batchId;
};

const processBatch = async (batchId: string, userIds: string[]) => {
  batches[batchId].status = 'processing';

  for (const userId of userIds) {
    const docId = randomUUID();

    // simulation génération PDF
    await new Promise(res => setTimeout(res, 20));

    documents[docId] = {
      id: docId,
      userId,
      content: `PDF for user ${userId}`
    };

    batches[batchId].documents.push(docId);
  }

  batches[batchId].status = 'completed';
};

export const getBatch = (batchId: string) => {
  return batches[batchId];
};

export const getDocument = (docId: string) => {
  return documents[docId];
};