import { CircuitBreakerOptions, State } from "../types";

export class CircuitBreaker<T> {
  private state: State = "CLOSED";
  private failureCount = 0;
  private successCount = 0;
  private nextTry = 0;

  constructor(
    private action: (...args: any[]) => Promise<T>,
    private options: CircuitBreakerOptions
  ) {}

  async execute(...args: any[]): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() > this.nextTry) {
        this.state = "HALF_OPEN";
        console.log("Circuit HALF_OPEN");
      } else {
        throw new Error("Circuit OPEN (fail fast)");
      }
    }

    try {
      const result = await this.action(...args);

      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === "HALF_OPEN") {
      this.successCount++;

      if (this.successCount >= this.options.successThreshold) {
        this.reset();
        console.log("Circuit CLOSED (recovered)");
      }
    } else {
      this.reset();
    }
  }

  private onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      this.nextTry = Date.now() + this.options.recoveryTimeout;

      console.log("Circuit OPEN");
    }
  }

  private reset() {
    this.failureCount = 0;
    this.successCount = 0;
    this.state = "CLOSED";
  }
}