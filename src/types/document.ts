export interface DocumentMeta {
  _id: string;
  filename: string;
  length: number;
  uploadDate: Date;
  metadata?: any;
}

export interface Document {
  _id: string;
  content: Buffer;
  createdAt: Date;
}