import {
  SFNClient,
  StartExecutionCommand
} from "@aws-sdk/client-sfn";

import type {
  StartExecutionRequest,
  StartExecutionResult,
  WorkflowOrchestrator
} from "../workflow/orchestration-boundary.js";

export class StepFunctionsOrchestrator implements WorkflowOrchestrator {
  constructor(
    private readonly stateMachineArn: string,
    private readonly client: SFNClient = new SFNClient({})
  ) {}

  async start(
    request: StartExecutionRequest
  ): Promise<StartExecutionResult> {
    const response = await this.client.send(
      new StartExecutionCommand({
        stateMachineArn: this.stateMachineArn,
        name: request.executionName,
        input: JSON.stringify({
          payload: request.payload,
          retryPolicy: request.retryPolicy
        })
      })
    );

    return {
      executionArn: response.executionArn ?? "",
      startedAt: response.startDate?.toISOString() ?? new Date().toISOString()
    };
  }
}
