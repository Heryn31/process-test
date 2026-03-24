import { Request, Response } from "express";
import * as service from "../services/document.service";

export const createBatch = (req: Request, res: Response) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: "userIds invalide" });
  }

  const batchId = service.createBatch(userIds);

  res.json({ batchId });
};

export const getBatch = (req: Request<{ batchId: string }>, res: Response) => {
  const batch = service.getBatch(req.params.batchId);

  if (!batch) {
    return res.status(404).json({ error: "Batch introuvable" });
  }

  res.json(batch);
};

export const getDocument = (
  req: Request<{ documentId: string }>,
  res: Response,
) => {
  const doc = service.getDocument(req.params.documentId);

  if (!doc) {
    return res.status(404).json({ error: "Document introuvable" });
  }

  // Simuler PDF
  res.setHeader("Content-Type", "application/pdf");
  res.send(Buffer.from(doc.content));
};
