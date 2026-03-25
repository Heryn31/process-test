import { IQueue } from "./IQueue";

export class MemoryQueue<T> implements IQueue<T> {
  private queue: T[] = [];

  add(job: T) {
    this.queue.push(job);
    return Promise.resolve();
  }

  async process(concurrency: number, handler: (job: T) => Promise<any>) {
    for (const job of this.queue) {
      await handler(job);
    }
  }
}