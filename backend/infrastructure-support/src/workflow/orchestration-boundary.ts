import type { RetryPolicy, StartWorkflowPayload } from "@shared/types";

export interface StartExecutionRequest {
  executionName: string;
  payload: StartWorkflowPayload;
  retryPolicy: RetryPolicy;
}

export interface StartExecutionResult {
  executionArn: string;
  startedAt: string;
}

export interface WorkflowOrchestrator {
  start(request: StartExecutionRequest): Promise<StartExecutionResult>;
}
