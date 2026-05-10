import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand as DocumentQueryCommand
} from "@aws-sdk/lib-dynamodb";

import type {
  DynamoDbClient,
  GetItemKey,
  PutItemInput,
  QueryItemsInput
} from "../repositories/dynamodb-client.js";

export class DocumentDynamoDbClient implements DynamoDbClient {
  private readonly client: DynamoDBDocumentClient;

  constructor(baseClient?: DynamoDBClient) {
    this.client = DynamoDBDocumentClient.from(baseClient ?? new DynamoDBClient({}));
  }

  async put(input: PutItemInput): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: input.tableName,
        Item: {
          ...input.key,
          ...input.item
        }
      })
    );
  }

  async get<T>(tableName: string, key: GetItemKey): Promise<T | null> {
    const response = await this.client.send(
      new GetCommand({
        TableName: tableName,
        Key: key
      })
    );

    return (response.Item as T | undefined) ?? null;
  }

  async query<T>(input: QueryItemsInput): Promise<T[]> {
    const expressionAttributeNames: Record<string, string> = {
      "#pk": "pk"
    };
    const expressionAttributeValues: Record<string, string> = {
      ":pk": input.partitionKey.pk
    };
    let keyConditionExpression = "#pk = :pk";

    if (input.sortKeyPrefix) {
      expressionAttributeNames["#sk"] = "sk";
      expressionAttributeValues[":skPrefix"] = input.sortKeyPrefix;
      keyConditionExpression += " AND begins_with(#sk, :skPrefix)";
    }

    const response = await this.client.send(
      new DocumentQueryCommand({
        TableName: input.tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      })
    );

    return (response.Items as T[] | undefined) ?? [];
  }
}
