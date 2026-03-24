import { Request, Response } from "express";
import * as service from "../services/document.service";
import { documentQueue } from "../queue/document.queue";

const JOB_ATTEMPTS = 3;
const JOB_BACKOFF_DELAY = 1000;

export const createBatch = async (req: Request, res: Response) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || userIds.length === 0)
    return res.status(400).json({ error: "userIds invalide" });

  const batchId = await service.createBatch(userIds);

  const job = await documentQueue.add(
    { batchId, userIds },
    {
      jobId: batchId,
      attempts: JOB_ATTEMPTS,
      backoff: { type: "exponential", delay: JOB_BACKOFF_DELAY },
    },
  );
  console.log("Job ajouté à Bull :", job.id, job.data);

  res.json({ batchId });
};

export const getBatch = async (
  req: Request<{ batchId: string }>,
  res: Response,
) => {
  const batchId = req.params.batchId;

  const batch = await service.getBatch(batchId);
  if (!batch) {
    return res.status(404).json({ error: "Batch introuvable" });
  }

  const job = await documentQueue.getJob(batchId);
  if (!job) {
    return res.status(404).json({ error: "Job Bull introuvable" });
  }

  const progress: number = job.progress();
  const status: string = (await job.getState()).toString();

  res.json({
    batchId,
    progress,
    status,
    documents: batch.documentIds || [],
  });
};

export const getDocument = async (
  req: Request<{ documentId: string }>,
  res: Response,
) => {
  const doc = await service.getDocument(req.params.documentId);

  if (!doc) {
    return res.status(404).json({ error: "Document introuvable" });
  }

  // Simuler PDF
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(doc.content || "")); // fallback si doc.content manquant
};
