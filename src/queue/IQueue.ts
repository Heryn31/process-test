export interface IQueue<T> {
  process(concurrency: number, handler: (job: T) => Promise<any>): void;
  add(data: T): Promise<any>;
}