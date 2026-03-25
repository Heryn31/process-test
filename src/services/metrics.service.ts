import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const documentsGenerated = new client.Counter({
  name: "documents_generated_total",
  help: "Nombre total de documents générés",
  registers: [register] 
});

export const batchDuration = new client.Histogram({
  name: "batch_processing_duration_seconds",
  help: "Durée de traitement des batches",
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [register] 
});

export const queueSize = new client.Gauge({
  name: "queue_size",
  help: "Nombre de jobs",
  registers: [register] 
});