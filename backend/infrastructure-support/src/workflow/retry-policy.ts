import type { RetryPolicy } from "@shared/types";

export const defaultRetryPolicy: RetryPolicy = {
  maxAttempts: 3,
  initialIntervalSeconds: 5,
  backoffRate: 2
};
