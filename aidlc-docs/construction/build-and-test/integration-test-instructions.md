# 結合テスト手順

## 実行コマンド
- `npm run test:integration --prefix backend/infrastructure-support`

## 対象経路
- `StartRequestHandler`
- `DynamoDbRequestStateRepository`
- `DynamoDbRequestEventLogRepository`
- `GetRequestStatusHandler`

## 期待結果
- 結合テストファイル `1` 件が成功
- 保存した request state を status lookup で取得できること
- event log が `EVENT#` レコードのみ返すこと

## 失敗時の確認先
- state が見つからない場合:
  - `backend/infrastructure-support/src/runtime/document-dynamodb-client.ts`
  - `backend/infrastructure-support/src/repositories/dynamodb-request-state-repository.ts`
- event 件数が不正な場合:
  - `backend/infrastructure-support/src/repositories/dynamodb-request-event-log-repository.ts`
