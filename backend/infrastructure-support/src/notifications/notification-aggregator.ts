import type {
  FailureCategory,
  RequestEventRecord,
  RequestStateRecord
} from "@shared/types";

export interface HighSeverityNotification {
  requestId: string;
  workflowExecutionId: string;
  finalState: RequestStateRecord["currentState"];
  failureCategory: FailureCategory;
  summary: string;
  eventSummaries: string[];
}

export class NotificationAggregator {
  aggregate(input: {
    requestState: RequestStateRecord;
    workflowExecutionId: string;
    failureCategory: FailureCategory;
    events: RequestEventRecord[];
  }): HighSeverityNotification {
    return {
      requestId: input.requestState.requestId,
      workflowExecutionId: input.workflowExecutionId,
      finalState: input.requestState.currentState,
      failureCategory: input.failureCategory,
      summary: `${input.requestState.requestId} ended with ${input.requestState.currentState}`,
      eventSummaries: input.events.map((event) => event.summary)
    };
  }
}
