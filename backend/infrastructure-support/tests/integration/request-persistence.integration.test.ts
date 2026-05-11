import { describe, expect, it, vi } from "vitest";

import { GetRequestStatusHandler } from "../../src/api/get-request-status-handler.js";
import { StartRequestHandler } from "../../src/api/start-request-handler.js";
import type {
  GetItemKey,
  PutItemInput,
  QueryItemsInput
} from "../../src/repositories/dynamodb-client.js";
import { DynamoDbRequestEventLogRepository } from "../../src/repositories/dynamodb-request-event-log-repository.js";
import { DynamoDbRequestStateRepository } from "../../src/repositories/dynamodb-request-state-repository.js";
import { WorkflowStarter } from "../../src/workflow/workflow-starter.js";

class InMemoryDynamoDbClient {
  private readonly store = new Map<string, unknown>();

  async put(input: PutItemInput): Promise<void> {
    this.store.set(this.toCompositeKey(input.tableName, input.key), input.item);
  }

  async get<T>(tableName: string, key: GetItemKey): Promise<T | null> {
    const item = this.store.get(this.toCompositeKey(tableName, key));
    return (item as T | undefined) ?? null;
  }

  async query<T>(input: QueryItemsInput): Promise<T[]> {
    const partitionKey = input.partitionKey.pk;
    const sortKeyPrefix = input.sortKeyPrefix;

    return Array.from(this.store.entries())
      .filter(([compositeKey]) => {
        const expectedPrefix = `${input.tableName}|${partitionKey}|`;
        if (!compositeKey.startsWith(expectedPrefix)) {
          return false;
        }

        if (!sortKeyPrefix) {
          return true;
        }

        const [, , sortKey] = compositeKey.split("|");
        return sortKey.startsWith(sortKeyPrefix);
      })
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value as T);
  }

  private toCompositeKey(tableName: string, key: GetItemKey): string {
    return `${tableName}|${key.pk}|${key.sk}`;
  }
}

describe("request persistence integration", () => {
  it("persists request state and accepted event, then exposes them via status handler", async () => {
    const client = new InMemoryDynamoDbClient();
    const stateRepository = new DynamoDbRequestStateRepository(client, "requests");
    const eventRepository = new DynamoDbRequestEventLogRepository(client, "requests");
    const orchestrator = {
      start: vi.fn().mockResolvedValue({
        executionArn: "arn:aws:states:ap-northeast-1:123:execution:test",
        startedAt: "2026-05-10T00:00:00.000Z"
      })
    };
    const workflowStarter = new WorkflowStarter(orchestrator);
    const startHandler = new StartRequestHandler(
      stateRepository,
      eventRepository,
      workflowStarter
    );
    const statusHandler = new GetRequestStatusHandler(
      stateRepository,
      eventRepository
    );

    const started = await startHandler.handle({
      requestId: "req-100",
      requesterId: "user-100",
      mode: "must-succeed",
      requestedLeaveDate: "2026-06-15",
      reasonSummary: "family trip"
    });
    const status = await statusHandler.handle("req-100");

    expect(started.executionArn).toContain("execution:test");
    expect(orchestrator.start).toHaveBeenCalledTimes(1);
    expect(status).not.toBeNull();
    expect(status?.request.currentState).toBe("accepted");
    expect(status?.events).toHaveLength(1);
    expect(status?.events[0]).toMatchObject({
      requestId: "req-100",
      eventType: "RequestAccepted",
      stateAfter: "accepted"
    });
  });
});
