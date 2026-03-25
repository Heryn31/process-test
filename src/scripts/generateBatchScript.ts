import { documentQueue } from "../queue/document.queue";
import { connectDB, getBatchesCollection } from "../databases/db";
import { randomUUID } from "crypto";
import { queueSize } from "../services/metrics.service";

const NUM_DOCUMENTS = process.env.NUM_DOCUMENTS ? parseInt(process.env.NUM_DOCUMENTS) : 1000;
const QUEUE_SIZE_INTERVAL = process.env.QUEUE_SIZE_INTERVAL ? parseInt(process.env.QUEUE_SIZE_INTERVAL) : 5000;

const createTestBatch = async () => {
  await connectDB();
  const batches = getBatchesCollection();

  const batchId = randomUUID();
  const userIds: string[] = Array.from({ length: NUM_DOCUMENTS }, () =>
    randomUUID(),
  );

  const batch: any = {
    _id: batchId,
    userIds,
    status: "pending" as const,
    documentIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await batches.insertOne(batch);

  await documentQueue.add({
    batchId,
    userIds,
  });

  setInterval(async () => {
    try {
      const size = await documentQueue.count();
      queueSize.set(size);
    } catch (err) {
      console.error("Erreur queueSize:", err);
    }
  }, QUEUE_SIZE_INTERVAL);

  console.log(`Job ajouté à la queue pour batch ${batchId}`);
};

createTestBatch()
  .then(() => {
    console.log("Script terminé !");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erreur :", err);
    process.exit(1);
  });
