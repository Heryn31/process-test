import { documentQueue } from "../queue/document.queue";
import { connectDB, getBatchesCollection, getDocumentsCollection } from "../databases/db";
import { randomUUID } from "crypto";
import { Collection, WithId } from "mongodb";
import pLimit from "p-limit";
import { runDocumentWorker } from "../workers/runDocumentWorker";

const CONCURRENCY = 10;
const limit = pLimit(CONCURRENCY);

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

const startWorker = async () => {
  await connectDB();

  const batches: Collection<Batch> =
    getBatchesCollection() as unknown as Collection<Batch>;
  const documents: Collection<Document> =
    getDocumentsCollection() as unknown as Collection<Document>;

  documentQueue.process(CONCURRENCY, async (job) => {
    console.log("Job reçu dans le worker :", job.id, job.data);
    const { batchId, userIds } = job.data;

    const batch: WithId<Batch> | null = await batches.findOne({ _id: batchId });
    if (!batch) throw new Error("Batch introuvable");

    await batches.updateOne(
      { _id: batchId },
      { $set: { status: "processing", updatedAt: new Date() } },
    );
    try {
      const documentIds: string[] = [];

      await Promise.all(
        userIds.map((userId) =>
          limit(async () => {
            const docId = randomUUID();

            const buffer = await runDocumentWorker({ userId });

            await documents.insertOne({
              _id: docId,
              content: buffer,
              createdAt: new Date(),
            });

            console.log("✅ Document créé:", docId);

            documentIds.push(docId);
          }),
        ),
      );

      await batches.updateOne(
        { _id: batchId },
        {
          $push: { documentIds: { $each: documentIds } },
          $set: { status: "completed", updatedAt: new Date() },
        },
      );

      return { message: "Batch terminé", count: documentIds.length };
    } catch (err) {
      console.error("❌ Erreur batch:", err);

      await batches.updateOne(
        { _id: batchId },
        { $set: { status: "failed", updatedAt: new Date() } },
      );

      throw err;
    }
  });

  console.log(`Worker PDF démarré avec concurrency=${CONCURRENCY}`);
};

startWorker().catch((err) => console.error("Erreur worker PDF:", err));
