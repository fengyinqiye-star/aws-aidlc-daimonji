export interface PutItemInput {
  tableName: string;
  key: Record<string, string>;
  item: Record<string, unknown>;
}

export interface QueryItemsInput {
  tableName: string;
  partitionKey: Record<string, string>;
}

export interface DynamoDbClient {
  put(input: PutItemInput): Promise<void>;
  get<T>(tableName: string, key: Record<string, string>): Promise<T | null>;
  query<T>(input: QueryItemsInput): Promise<T[]>;
}
