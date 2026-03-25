import { getDB } from "../databases/db";
import { documentQueue } from "../queue/document.queue";

export const checkHealth = async () => {
  const results = {
    status: "ok" as "ok" | "error",
    services: {
      db: "ok",
      redis: "ok",
      queue: "ok",
    },
    timestamp: new Date(),
  };

  //DB check
  try {
    const db = getDB();
    await db.command({ ping: 1 });
  } catch (err) {
    results.services.db = "error";
    results.status = "error";
  }

  //Redis check (via Bull)
  try {
    const client = await documentQueue.client;
    await client.ping();
  } catch (err) {
    results.services.redis = "error";
    results.status = "error";
  }

  //Queue check
  try {
    await documentQueue.getWaitingCount();
  } catch (err) {
    results.services.queue = "error";
    results.status = "error";
  }

  return results;
};