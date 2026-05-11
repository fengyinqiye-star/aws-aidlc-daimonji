import type { RequestEventRecord } from "@shared/types";

export interface RequestEventLogRepository {
  append(record: RequestEventRecord): Promise<void>;
  listByRequestId(requestId: string): Promise<RequestEventRecord[]>;
}
