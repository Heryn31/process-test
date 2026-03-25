export type LogLevel = "info" | "error" | "warn";

export interface LogContext {
  batchId?: string;
  documentId?: string;
  userId?: string;
  [key: string]: any;
}