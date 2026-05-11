import { describe, expect, it } from "vitest";

import { RetryCoordinator } from "../../src/resilience/retry-coordinator.js";

describe("RetryCoordinator", () => {
  const coordinator = new RetryCoordinator({
    maxAttempts: 3,
    initialIntervalSeconds: 5,
    backoffRate: 2
  });

  it("retries transient failures within the attempt budget", () => {
    expect(coordinator.decide("transient", 1)).toEqual({
      shouldRetry: true,
      nextAttemptNumber: 2,
      waitSeconds: 10,
      finalCategory: "transient"
    });
  });

  it("promotes exhausted transient retries to fatal", () => {
    expect(coordinator.decide("transient", 3)).toEqual({
      shouldRetry: false,
      nextAttemptNumber: 4,
      waitSeconds: 0,
      finalCategory: "fatal"
    });
  });
});
