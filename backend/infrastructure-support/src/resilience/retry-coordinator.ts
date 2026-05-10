import type { FailureCategory, RetryPolicy, RetryRecord } from "@shared/types";

export interface RetryDecision {
  shouldRetry: boolean;
  nextAttemptNumber: number;
  waitSeconds: number;
  finalCategory: FailureCategory;
}

export class RetryCoordinator {
  constructor(private readonly policy: RetryPolicy) {}

  decide(
    failureCategory: FailureCategory,
    previousAttempts: number
  ): RetryDecision {
    if (failureCategory !== "transient") {
      return {
        shouldRetry: false,
        nextAttemptNumber: previousAttempts,
        waitSeconds: 0,
        finalCategory: failureCategory
      };
    }

    const nextAttemptNumber = previousAttempts + 1;
    if (nextAttemptNumber > this.policy.maxAttempts) {
      return {
        shouldRetry: false,
        nextAttemptNumber,
        waitSeconds: 0,
        finalCategory: "fatal"
      };
    }

    return {
      shouldRetry: true,
      nextAttemptNumber,
      waitSeconds:
        this.policy.initialIntervalSeconds *
        Math.pow(this.policy.backoffRate, previousAttempts),
      finalCategory: "transient"
    };
  }

  createRecord(
    requestId: string,
    targetOperation: string,
    decision: RetryDecision
  ): RetryRecord {
    const now = new Date().toISOString();

    return {
      retryId: `${requestId}-${targetOperation}-${decision.nextAttemptNumber}`,
      requestId,
      targetOperation,
      attemptNumber: decision.nextAttemptNumber,
      maxAttempts: this.policy.maxAttempts,
      failureCategory: decision.finalCategory,
      scheduledAt: now,
      finishedAt: decision.shouldRetry ? undefined : now,
      result: decision.shouldRetry ? "pending" : "exhausted"
    };
  }
}
