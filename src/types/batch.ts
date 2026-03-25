export type BatchStatus = "pending" | "processing" | "completed" | "failed";

export interface Batch {
  _id: string;
  userIds: string[];
  status: BatchStatus;
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}