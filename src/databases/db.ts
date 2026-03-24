import { MongoClient, Db, Collection, GridFSBucket } from "mongodb";

const MONGO_URI = "mongodb://127.0.0.1:27017";
const DB_NAME = "pdf_service";

let db: Db;

export const connectDB = async () => {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log("MongoDB connecté ✅");
  db = client.db(DB_NAME);
  const bucket = new GridFSBucket(db, {
    bucketName: "pdfs",
  });
  return db;
};

export const getDB = () => {
  if (!db) throw new Error("DB non initialisée, appeler connectDB()");
  return db;
};

export const getBatchesCollection = (): Collection =>
  getDB().collection("batches");
export const getDocumentsCollection = (): Collection =>
  getDB().collection("documents");
