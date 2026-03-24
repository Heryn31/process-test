import { documentQueue } from "../queue/document.queue";
import { connectDB, getBatchesCollection } from "../databases/db";
import { randomUUID } from "crypto";

const NUM_DOCUMENTS = 1000;

const createTestBatch = async () => {
  await connectDB();
  const batches = getBatchesCollection();

  const batchId = randomUUID();
  const userIds: string[] = Array.from({ length: NUM_DOCUMENTS }, () => randomUUID());

  const batch : any = {
    _id: batchId,
    userIds,
    status: "pending" as const,
    documentIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await batches.insertOne(batch);
  console.log(`📦 Batch ${batchId} inséré avec ${NUM_DOCUMENTS} documents`);

  await documentQueue.add({
    batchId,
    userIds,
  });

  console.log(`🚀 Job ajouté à la queue pour batch ${batchId}`);
};

createTestBatch()
  .then(() => {
    console.log("✅ Script terminé !");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Erreur :", err);
    process.exit(1);
  });