import type { FailureCategory } from "@shared/types";

export interface FailureSignal {
  code?: string;
  message: string;
  retriable?: boolean;
}

export class FailureClassifier {
  classify(signal: FailureSignal): FailureCategory {
    if (signal.retriable) {
      return "transient";
    }

    if ((signal.code ?? "").startsWith("BUSINESS_")) {
      return "business";
    }

    return "fatal";
  }
}
