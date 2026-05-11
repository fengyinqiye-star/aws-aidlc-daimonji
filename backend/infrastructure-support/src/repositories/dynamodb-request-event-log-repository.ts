import type { RequestEventRecord } from "@shared/types";

import type { DynamoDbClient } from "./dynamodb-client.js";
import type { RequestEventLogRepository } from "./request-event-log-repository.js";

export class DynamoDbRequestEventLogRepository
  implements RequestEventLogRepository
{
  constructor(
    private readonly client: DynamoDbClient,
    private readonly tableName: string
  ) {}

  async append(record: RequestEventRecord): Promise<void> {
    await this.client.put({
      tableName: this.tableName,
      key: { pk: record.requestId, sk: `EVENT#${record.occurredAt}#${record.eventId}` },
      item: record
    });
  }

  async listByRequestId(requestId: string): Promise<RequestEventRecord[]> {
    return this.client.query<RequestEventRecord>({
      tableName: this.tableName,
      partitionKey: { pk: requestId },
      sortKeyPrefix: "EVENT#"
    });
  }
}
