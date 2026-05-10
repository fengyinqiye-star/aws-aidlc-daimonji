import type { RequestStateRecord } from "@shared/types";

import type { DynamoDbClient } from "./dynamodb-client.js";
import type { RequestStateRepository } from "./request-state-repository.js";

export class DynamoDbRequestStateRepository implements RequestStateRepository {
  constructor(
    private readonly client: DynamoDbClient,
    private readonly tableName: string
  ) {}

  async save(record: RequestStateRecord): Promise<void> {
    await this.client.put({
      tableName: this.tableName,
      key: { pk: record.requestId, sk: "STATE" },
      item: record
    });
  }

  async findById(requestId: string): Promise<RequestStateRecord | null> {
    return this.client.get<RequestStateRecord>(this.tableName, {
      pk: requestId,
      sk: "STATE"
    });
  }
}
