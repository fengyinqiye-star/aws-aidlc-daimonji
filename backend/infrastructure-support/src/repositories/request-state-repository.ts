import type { RequestStateRecord } from "@shared/types";

export interface RequestStateRepository {
  save(record: RequestStateRecord): Promise<void>;
  findById(requestId: string): Promise<RequestStateRecord | null>;
}
