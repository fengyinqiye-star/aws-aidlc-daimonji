# Infrastructure and Operational Support Tech Stack Decisions

## 決定サマリー
この Unit の restarted NFR に基づき、MVP では AWS マネージドサービス中心の単一リージョン構成を採用する。重点は、Step Functions によるタスク分解、Bedrock AgentCore Runtime の組み込み、task 単位監視、機微情報保護、TypeScript 向け PBT 基盤である。

## 1. オーケストレーション

### `AWS Step Functions`
- 採用する
- 理由:
  - FR-09 相当の論理ステップを task 単位で管理できる
  - 分岐、待機、再試行、失敗終端をワークフロー定義として明示できる
  - デモ時に「どこで止まったか」を説明しやすい

## 2. タスク実行

### `AWS Lambda`
- 採用する
- 理由:
  - task 単位の処理を分割しやすい
  - API 入口 Lambda と task Lambda を分離できる
  - 障害局所化とログ分離に向く

## 3. エージェント実行

### `Amazon Bedrock AgentCore Runtime`
- 採用する
- 理由:
  - Inception で承認済みの Bedrock 中心アーキテクチャに整合する
  - Negotiation Orchestrator Agent と Lawyer Agent の責務境界を置ける
  - Step Functions から必要時のみ呼び出す実行モデルと相性がよい

### フォールバック方針
- Bedrock 障害時に別推論基盤へ自動切替はしない
- MVP では再試行または人間レビューへのフォールバックを採る

## 4. 状態保存

### `Amazon DynamoDB`
- 採用する
- 理由:
  - request 現在状態、event log、task execution 記録を低運用で保持できる
  - requestId 基点の読み取りが明確
  - Lambda / Step Functions と親和性が高い

## 5. API 公開

### `Amazon API Gateway`
- 採用する
- 理由:
  - Frontend Unit へ渡す公開 API 契約を安定化しやすい
  - API 入口と backend 実行責務を分離できる
  - Amplify Hosting から接続する前提と整合する

## 6. 可観測性

### `Amazon CloudWatch Logs`
- 採用する
- 理由:
  - task 単位ログの標準基盤になる
  - Lambda、Step Functions、補助処理を一貫して追跡できる

### `Amazon CloudWatch Metrics / Alarms`
- 採用する
- 理由:
  - task 単位の重大障害を検知するために必要
  - MVP でも障害局所化の説明責任を満たせる

### 通知先: `Slack Webhook`
- 採用する
- 理由:
  - AI が要約可能な高重要度障害だけを運用者へ通知するのに十分
  - デモ運用で即時気付きが得やすい

## 7. シークレット管理

### `AWS Secrets Manager`
- 採用する
- 理由:
  - Slack Webhook などの秘密情報をアプリコードや平文変数から分離できる
  - IAM 制御と合わせて MVP 最低限の安全性を確保できる

## 8. Frontend 連携契約

### 固定する項目
- API Base URL
- `POST /requests`
- `GET /requests/{requestId}`
- 必要 environment variable 名

### 後続 Unit へ委ねる項目
- Amplify Hosting の詳細 IaC
- frontend 側のビルド/デプロイ設定

## 9. TypeScript 向け PBT framework

### `fast-check`
- 正式採用候補ではなく、正式採用とする
- 理由:
  - TypeScript / JavaScript で成熟している
  - custom generator、shrinking、seed-based reproducibility を満たす
  - 既存 test runner との統合がしやすい

### 運用方針
- Code Generation で `fast-check` を dependency として追加する
- CI では seed 再現性を担保できる形で実行方針を定義する

## 10. 今回見送るもの

### `AWS X-Ray` / 詳細分散トレーシング
- 今回は見送る
- 理由:
  - MVP では task 単位ログと Alarm を優先する
  - まずは failure localization を最短で確立する

### マルチリージョン構成
- 今回は見送る
- 理由:
  - 単一リージョン MVP の前提に合わない
  - デモと初期検証には過剰

### Bedrock 以外の推論基盤追加
- 今回は見送る
- 理由:
  - restart 方針と Inception 承認範囲から外れる

## PBT-09 対応メモ
- 適用言語: TypeScript
- 選定 framework: `fast-check`
- Code Generation で追加予定 dependency:
  - `fast-check`
- 満たすべき要件:
  - custom generators
  - shrinking
  - seed-based reproducibility
  - test runner integration
