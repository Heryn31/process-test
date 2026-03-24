import { Collection, WithId } from 'mongodb';
import { connectDB, getBatchesCollection, getDocumentsCollection } from '../databases/db';
import { randomUUID } from 'crypto';

interface Batch {
  _id: string;
  userIds: string[];
  status: string;
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Document {
  _id: string;
  content: Buffer | string;
  createdAt: Date;
}

let batches: Collection<Batch>;
let documents: Collection<Document>;

export const startService = async () => {
  await connectDB();
  batches = getBatchesCollection() as unknown as Collection<Batch>;
  documents = getDocumentsCollection() as unknown as Collection<Document>;
  console.log('Service MongoDB prêt ✅');
};

export const createBatch = async (userIds: string[]) => {
  if (!batches) throw new Error("DB non initialisée");

  const batchId = randomUUID();
  await batches.insertOne({
    _id: batchId,
    userIds,
    status: "pending",
    documentIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return batchId;
};

export const getBatch = async (batchId: string): Promise<WithId<Batch> | null> => {
  if (!batches) throw new Error("DB non initialisée");
  return await batches.findOne({ _id: batchId });
};

export const getDocument = async (docId: string): Promise<WithId<Document> | null> => {
  if (!documents) throw new Error("DB non initialisée");
  return await documents.findOne({ _id: docId });
};


startService().catch(err => console.error("Erreur démarrage service:", err));