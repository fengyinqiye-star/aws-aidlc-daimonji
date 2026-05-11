import type { StartWorkflowPayload } from "@shared/types";

import { defaultRetryPolicy } from "./retry-policy.js";
import type {
  StartExecutionResult,
  WorkflowOrchestrator
} from "./orchestration-boundary.js";

export interface WorkflowStarterInput {
  requestId: string;
  requesterId: string;
  mode: StartWorkflowPayload["mode"];
  requestedLeaveDate: string;
  reasonSummary: string;
  requestedAt?: string;
}

export class WorkflowStarter {
  constructor(private readonly orchestrator: WorkflowOrchestrator) {}

  async start(input: WorkflowStarterInput): Promise<StartExecutionResult> {
    const payload: StartWorkflowPayload = {
      requestId: input.requestId,
      requesterId: input.requesterId,
      mode: input.mode,
      requestedLeaveDate: input.requestedLeaveDate,
      reasonSummary: input.reasonSummary,
      requestedAt: input.requestedAt ?? new Date().toISOString()
    };

    return this.orchestrator.start({
      executionName: input.requestId,
      payload,
      retryPolicy: defaultRetryPolicy
    });
  }
}
