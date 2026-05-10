import type {
  RequestEventRecord,
  RequestStateRecord,
  VacationMode
} from "@shared/types";

import type { RequestEventLogRepository } from "../repositories/request-event-log-repository.js";
import type { RequestStateRepository } from "../repositories/request-state-repository.js";
import type { WorkflowStarter } from "../workflow/workflow-starter.js";

export interface StartRequestApiInput {
  requestId: string;
  requesterId: string;
  mode: VacationMode;
  requestedLeaveDate: string;
  reasonSummary: string;
}

export interface StartRequestApiResponse {
  requestId: string;
  state: RequestStateRecord["currentState"];
  executionArn: string;
}

export class StartRequestHandler {
  constructor(
    private readonly stateRepository: RequestStateRepository,
    private readonly eventRepository: RequestEventLogRepository,
    private readonly workflowStarter: WorkflowStarter
  ) {}

  async handle(input: StartRequestApiInput): Promise<StartRequestApiResponse> {
    const now = new Date().toISOString();

    const requestState: RequestStateRecord = {
      requestId: input.requestId,
      requesterId: input.requesterId,
      mode: input.mode,
      requestedLeaveDate: input.requestedLeaveDate,
      reasonSummary: input.reasonSummary,
      currentState: "accepted",
      currentOwner: "ai",
      createdAt: now,
      updatedAt: now
    };

    const acceptedEvent: RequestEventRecord = {
      eventId: `${input.requestId}-accepted`,
      requestId: input.requestId,
      eventType: "RequestAccepted",
      stateAfter: "accepted",
      summary: "Vacation negotiation request accepted.",
      causedBy: "user",
      occurredAt: now
    };

    await this.stateRepository.save(requestState);
    await this.eventRepository.append(acceptedEvent);

    const started = await this.workflowStarter.start({
      requestId: input.requestId,
      requesterId: input.requesterId,
      mode: input.mode,
      requestedLeaveDate: input.requestedLeaveDate,
      reasonSummary: input.reasonSummary,
      requestedAt: now
    });

    return {
      requestId: input.requestId,
      state: requestState.currentState,
      executionArn: started.executionArn
    };
  }
}
