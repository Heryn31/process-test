import { documentQueue } from "../queue/document.queue";
import {
  connectDB,
  getBatchesCollection,
  getDB,
  getDocumentsCollection,
} from "../databases/db";
import { randomUUID } from "crypto";
import { WithId } from "mongodb";
import pLimit from "p-limit";
import { runDocumentWorker } from "../workers/runDocumentWorker";
import { docusignBreaker } from "../services/docusignBreaker";
import os from "os";
import { Batch } from "../types";
import { checkMongo } from "../services/dbHealth";
import { withTimeout } from "../utils/withTimeout";
import { MemoryQueue } from "../queue/fallbackQueue";
import { IQueue } from "../queue/IQueue";
import { logger } from "../utils/logger";
import { batchDuration, documentsGenerated, queueSize } from "../services/metrics.service";

const CONCURRENCY = process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 4;
const WORKER_LIMIT = os.cpus().length;
const PDF_GENERATION_TIMEOUT = process.env.PDF_GENERATION_TIMEOUT ? parseInt(process.env.PDF_GENERATION_TIMEOUT) : 5000;
const QUEUE_SIZE_INTERVAL = process.env.QUEUE_SIZE_INTERVAL ? parseInt(process.env.QUEUE_SIZE_INTERVAL) : 1000;
const DOCU_SIGN_TIMEOUT = process.env.DOCU_SIGN_TIMEOUT ? parseInt(process.env.DOCU_SIGN_TIMEOUT) : 2000;
const limit = pLimit(WORKER_LIMIT);

let isShuttingDown = false;
let queue: IQueue<any>;
let isRedisAvailable = true;

const startWorker = async () => {
  await connectDB();
  try {
    const client = await documentQueue.client;
    await client.ping();
  } catch {
    console.warn("⚠️ Redis down, fallback en mémoire");
    isRedisAvailable = false;
  }

  if (isRedisAvailable) {
    queue = documentQueue;
  } else {
    queue = new MemoryQueue();
  }

  const batches = getBatchesCollection();
  const documents = getDocumentsCollection();

  setInterval(async () => {
    const size = await documentQueue.count();
    queueSize.set(size);
  }, QUEUE_SIZE_INTERVAL);

  documentQueue.process(CONCURRENCY, async (job) => {
    // Check MongoDB connection
    if (!(await checkMongo())) throw new Error("MongoDB down");

    // Check shutdown flag
    if (isShuttingDown) {
      throw new Error("Worker shutting down");
    }

    const { batchId, userIds } = job.data;
    logger.info("Nouveau job reçu", { batchId, job: job.id });

    const batch: WithId<Batch> | null = await batches.findOne({ _id: batchId });
    if (!batch) throw new Error("Batch introuvable");

    await batches.updateOne(
      { _id: batchId },
      { $set: { status: "processing", updatedAt: new Date() } },
    );

    const endBatchTimer = batchDuration.startTimer();

    try {
      const results = await Promise.all(
        userIds.map((userId) =>
          limit(async () => {
            const docId = randomUUID();

            logger.info("Début génération document", {
              batchId,
              documentId: docId,
              userId,
            });

            const buffer = await withTimeout(
              runDocumentWorker({ userId }),
              PDF_GENERATION_TIMEOUT,
            );

            await documents.insertOne({
              _id: docId,
              content: buffer,
              createdAt: new Date(),
            });

            documentsGenerated.inc();

            logger.info("Document créé", {
              batchId,
              documentId: docId,
              userId,
            });

            if (Math.random() < 0.01) {
              console.log("Generating document...");
            }

            // Breaker
            try {
              const withTimeout = (promise: Promise<any>, ms: number) =>
                Promise.race([
                  promise,
                  new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("timeout")), ms),
                  ),
                ]);

              try {
                await withTimeout(docusignBreaker.execute(userId), DOCU_SIGN_TIMEOUT);
                if (Math.random() < 0.01) {
                  logger.info("DocuSign OK", {
                    batchId,
                    documentId: docId,
                    userId,
                  });
                }
              } catch (err: any) {
                logger.warn("DocuSign SKIPPED:", {
                  batchId,
                  documentId: docId,
                  userId,
                  message: err.message,
                });
              }
            } catch (err: any) {
              logger.error("Erreur DocuSign:", {
                batchId,
                documentId: docId,
                userId,
                message: err.message,
              });
            }

            return docId;
          }),
        ),
      );

      const documentIds = results;

      await batches.updateOne(
        { _id: batchId },
        {
          $push: { documentIds: { $each: documentIds } },
          $set: { status: "completed", updatedAt: new Date() },
        },
      );

      logger.info("Batch terminé", {
        batchId,
        count: results.length,
      });

      return { message: "Batch terminé", count: documentIds.length };
    } catch (err: any) {
      logger.error("Erreur worker PDF:", {
        batchId,
        job: job.id,
        message: err.message,
      });

      await batches.updateOne(
        { _id: batchId },
        { $set: { status: "failed", updatedAt: new Date() } },
      );

      throw err;
    }
    finally {
      endBatchTimer();
    }
  });
};

startWorker().catch((err) => console.error("Erreur worker PDF:", err));

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\nSignal reçu: ${signal}`);
  console.log("Arrêt progressif en cours...");

  try {
    // 1. Stop queue (attend les jobs en cours)
    await documentQueue.close();
    console.log("Queue fermée");

    // 2. Fermer Mongo
    const db = getDB();
    await db.client?.close?.();
    console.log("MongoDB fermé");

    console.log("Shutdown propre terminé");
    setTimeout(() => process.exit(0), 100);
  } catch (err) {
    console.error("Erreur shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
