import { MongoClient, Db, Collection, GridFSBucket } from "mongodb";
import { Batch, Document } from "../types";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "pdf_service";

let db: Db;
let client: MongoClient;

export const connectDB = async () => {
  client = new MongoClient(MONGO_URI, {
    maxPoolSize: 20,
    wtimeoutMS: 2500,
  });
  await client.connect();
  console.log("MongoDB connecté");
  db = client.db(DB_NAME);
  return db;
};

export const closeDB = async () => {
  if (client) await client.close();
  console.log("MongoDB fermé");
};

export const getDB = () => {
  if (!db) throw new Error("DB non initialisée, appeler connectDB()");
  return db;
};

export const getBatchesCollection = () => db.collection<Batch>("batches");

export const getDocumentsCollection = () =>
  db.collection<Document>("documents");

export const getPDFBucket = () => {
  if (!db) throw new Error("DB non initialisée");
  return new GridFSBucket(db, { bucketName: "pdfs" });
};
