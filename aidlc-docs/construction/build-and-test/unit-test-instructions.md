# 単体テスト手順

## 実行コマンド
- `npm run test:unit --prefix backend/infrastructure-support`

## 対象
- workflow payload 生成
- failure classification
- retry backoff / exhausted 判定
- notification aggregation
- request acceptance API 挙動

## 期待結果
- 単体テストファイル `5` 件が成功
- テストケース `8` 件が成功

## 失敗時の確認先
- `StartRequestHandler` 系:
  - `backend/infrastructure-support/src/api/start-request-handler.ts`
  - `backend/infrastructure-support/src/workflow/workflow-starter.ts`
- retry 系:
  - `backend/infrastructure-support/src/resilience/retry-coordinator.ts`
