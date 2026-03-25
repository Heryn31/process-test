export type WorkerResponse = WorkerSuccess | WorkerError;

export interface WorkerInput {
  userId: string;
}

export interface WorkerSuccess {
  success: true;
  buffer: Buffer;
}

export interface WorkerError {
  success: false;
  error: string;
}