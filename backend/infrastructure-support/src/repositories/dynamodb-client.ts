export interface GetItemKey {
  pk: string;
  sk: string;
}

export interface PutItemInput {
  tableName: string;
  key: GetItemKey;
  item: object;
}

export interface QueryItemsInput {
  tableName: string;
  partitionKey: Pick<GetItemKey, "pk">;
  sortKeyPrefix?: string;
}

export interface DynamoDbClient {
  put(input: PutItemInput): Promise<void>;
  get<T>(tableName: string, key: GetItemKey): Promise<T | null>;
  query<T>(input: QueryItemsInput): Promise<T[]>;
}
