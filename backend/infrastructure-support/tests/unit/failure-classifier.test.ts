import { describe, expect, it } from "vitest";

import { FailureClassifier } from "../../src/resilience/failure-classifier.js";

describe("FailureClassifier", () => {
  const classifier = new FailureClassifier();

  it("classifies retriable failures as transient", () => {
    expect(
      classifier.classify({
        message: "timeout",
        retriable: true
      })
    ).toBe("transient");
  });

  it("classifies business-coded failures as business", () => {
    expect(
      classifier.classify({
        code: "BUSINESS_POLICY_BLOCK",
        message: "manager rejected"
      })
    ).toBe("business");
  });

  it("classifies other failures as fatal", () => {
    expect(
      classifier.classify({
        code: "UNKNOWN",
        message: "panic"
      })
    ).toBe("fatal");
  });
});
