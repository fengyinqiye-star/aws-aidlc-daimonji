# Backend

`backend/` には Unit ごとの backend 実装を配置します。現在は `infrastructure-support` のみ実装済みです。

## 実装済み
- [infrastructure-support](/C:/Users/user/OneDrive/Desktop/001_Project/aws-aidlc-daimonji/backend/infrastructure-support)
  - request start / status API handler
  - workflow starter
  - DynamoDB repository
  - Lambda entrypoint
  - AWS runtime adapter

## 実行コマンド
- `npm run lint --prefix backend/infrastructure-support`
- `npm run build --prefix backend/infrastructure-support`
- `npm run test:unit --prefix backend/infrastructure-support`
- `npm run test:integration --prefix backend/infrastructure-support`
