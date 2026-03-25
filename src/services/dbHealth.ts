import { getDB } from "../databases/db";

export const checkMongo = async () => {
  try {
    const db = getDB();
    await db.command({ ping: 1 });
    return true;
  } catch (err : any) {
    console.error("MongoDB non disponible:", err.message);
    return false;
  }
};