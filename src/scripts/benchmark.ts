import { documentQueue } from "../queue/document.queue";
import { connectDB, getBatchesCollection } from "../databases/db";
import { randomUUID } from "crypto";
import { documentsGenerated, queueSize } from "../services/metrics.service";

const NUM_DOCUMENTS = process.env.NUM_DOCUMENTS ? parseInt(process.env.NUM_DOCUMENTS) : 1000;
const QUEUE_SIZE_INTERVAL = process.env.QUEUE_SIZE_INTERVAL ? parseInt(process.env.QUEUE_SIZE_INTERVAL) : 5000;

const benchmark = async () => {
  await connectDB();

  const batches = getBatchesCollection();
  const batchId = randomUUID();
  const userIds: string[] = Array.from({ length: NUM_DOCUMENTS }, () =>
    randomUUID(),
  );

  const startTime = process.hrtime.bigint();
  const startCPU = process.cpuUsage();

  const batch = {
    _id: batchId,
    userIds,
    status: "pending" as const,
    documentIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await batches.insertOne(batch);

  await documentQueue.add({ batchId, userIds });

  documentsGenerated.inc();

  console.log("Batch envoyé, attente de completion...");

  // Dans benchmark-with-server.ts
  setInterval(async () => {
    try {
      const size = await documentQueue.count();
      queueSize.set(size);
      const currentValue = await queueSize.get();
      console.log(
        `[BENCHMARK] 📊 Queue size: ${size} (métrique: ${currentValue})`,
      );
    } catch (err) {
      console.error("Erreur queueSize:", err);
    }
  }, QUEUE_SIZE_INTERVAL);

  while (true) {
    const b = await batches.findOne({ _id: batchId });
    if (b?.status === "completed") break;
    await new Promise((res) => setTimeout(res, 500));
  }

  const endTime = process.hrtime.bigint();
  const durationMs = Number(endTime - startTime) / 1e6;

  const cpu = process.cpuUsage(startCPU);

  const memory = process.memoryUsage();

  const docsPerSec = NUM_DOCUMENTS / (durationMs / 1000);

  console.log("\n===== BENCHMARK =====");
  console.log(`Documents: ${NUM_DOCUMENTS}`);
  console.log(`Temps total: ${durationMs.toFixed(2)} ms`);
  console.log(`Débit: ${docsPerSec.toFixed(2)} docs/sec`);

  console.log("\nCPU:");
  console.log(`User: ${(cpu.user / 1000).toFixed(2)} ms`);
  console.log(`System: ${(cpu.system / 1000).toFixed(2)} ms`);

  console.log("\nMémoire:");
  console.log(`RSS: ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);

  console.log("========================\n");

  process.exit(0);
};

benchmark().catch(console.error);
