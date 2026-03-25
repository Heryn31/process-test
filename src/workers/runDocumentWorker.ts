import { Worker } from "worker_threads";
import path from "path";
import { WorkerInput, WorkerResponse } from "../types";

export const runDocumentWorker = (data: WorkerInput): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.resolve(__dirname, "./document.worker.js"),
      {
        workerData: data,
      }
    );

    worker.on("message", (msg: WorkerResponse) => {
      if (msg.success) {
        resolve(msg.buffer);
      } else {
        reject(new Error(msg.error));
      }
    });

    worker.on("error", reject);

    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with code ${code}`));
      }
    });
  });
};