import type {
  RequestEventRecord,
  RequestStateRecord
} from "@shared/types";

import type { RequestEventLogRepository } from "../repositories/request-event-log-repository.js";
import type { RequestStateRepository } from "../repositories/request-state-repository.js";

export interface RequestStatusResponse {
  request: RequestStateRecord;
  events: RequestEventRecord[];
}

export class GetRequestStatusHandler {
  constructor(
    private readonly stateRepository: RequestStateRepository,
    private readonly eventRepository: RequestEventLogRepository
  ) {}

  async handle(requestId: string): Promise<RequestStatusResponse | null> {
    const request = await this.stateRepository.findById(requestId);
    if (!request) {
      return null;
    }

    const events = await this.eventRepository.listByRequestId(requestId);
    return { request, events };
  }
}
