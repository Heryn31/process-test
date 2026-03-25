import { CircuitBreaker } from "./circuitBreaker";
import { sendToDocuSign } from "./docusign.service";

export const docusignBreaker = new CircuitBreaker(sendToDocuSign, {
  failureThreshold: 5,
  recoveryTimeout: 5000,
  successThreshold: 2,
});