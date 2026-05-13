# Infrastructure and Operational Support インフラ設計

## 概要
本書は、restart 後の `Infrastructure and Operational Support` Unit に対するインフラ設計を定義する。基準は restarted Functional Design、restarted NFR Requirements、restarted NFR Design であり、再実行前の coarse-grained な実装ではなく、Step Functions の task 分解、Bedrock AgentCore Runtime、request tracking、task 単位 observability、frontend 向け公開契約を前提にしている。

## 1. 採用するクラウド / 配置前提

### クラウド方針
- AWS を採用する
- MVP は単一リージョン構成とする

### 環境方針
- 現段階の MVP では単一環境を前提とする
- 将来の `dev` / `stg` / `prod` 分離に備えて、命名規則と設定分離が可能な構成を維持する

## 2. 公開入口のインフラ対応

### Public Request Entry
- `Amazon API Gateway` を公開 API 入口として採用する

### 役割
- frontend など外部クライアントからの HTTP リクエストを受け付ける
- `POST /requests`
- `GET /requests/{requestId}`

### 設計意図
- 公開 API 境界を一箇所に固定する
- 内部 workflow / task 間通信は API Gateway に戻さない
- frontend 向け公開契約を安定化させる

## 3. workflow 開始と orchestration のインフラ対応

### Workflow Starter
- `AWS Lambda` を採用する

### Workflow State Coordinator
- `AWS Step Functions` を採用する

### 役割分担
- `API Gateway -> Workflow Starter Lambda -> Step Functions` を基本入口とする
- Workflow Starter は request 受理、初期 state 作成、初回 event 記録、state machine 起動だけを担う
- Step Functions は task 単位での分岐、待機、再試行、終端遷移を担う

### restart 方針との対応
- Pass state 1 個だけの粗い flow には戻さない
- FR-09 相当の task 分解を infrastructure 前提として保持する

## 4. task 実行のインフラ対応

### Task Execution Layer
- `AWS Lambda` を task 単位の実行基盤として採用する

### 設計方針
- API 入口 Lambda と task Lambda を分離する
- task ごとの責務を粗く潰さず、workflow step 単位の failure localization を維持する
- Bedrock 呼び出しを含む task は一般 task と区別できるようにする

### 想定する task 群
- request intent extraction
- missing information check
- calendar / team data loading
- score / planning support
- review / notification support
- final registration / failure transition

## 5. Bedrock AgentCore Runtime のインフラ対応

### Bedrock Agent Runtime Gateway
- `Amazon Bedrock AgentCore Runtime` を採用する

### 役割
- orchestrator agent / lawyer agent の実行境界を提供する
- Bedrock 呼び出し遅延と障害を一般 task と分離観測する

### 設計意図
- restart 理由のひとつである Bedrock 未反映を解消する
- `AgentRuntimeFailure` を明示的に扱える構成にする

### 補足
- Bedrock 以外の推論基盤追加や自動切替は MVP では扱わない

## 6. request tracking のインフラ対応

### Request State Store
- `Amazon DynamoDB` を採用する

### Request Event Log
- `Amazon DynamoDB` を採用する

### Task Execution Record
- 同じく `Amazon DynamoDB` 上で保持してよいが、論理的には current state / event log / task execution record を分離して扱う

### 設計意図
- current state は高速 read の主経路にする
- event log は監査 / 説明責任 / troubleshooting の主経路にする
- task 実行記録は request / workflow / task / retry / failure の相関を保持する

## 7. secret 管理のインフラ対応

### Secret Access Boundary
- `AWS Secrets Manager` を採用する

### 対象
- Slack Webhook
- 将来追加される外部通知用 secret

### 設計意図
- secret をコードや平文環境変数へ直接埋め込まない
- task 実装から secret の解決責務を分離する

## 8. 可観測性 / 通知のインフラ対応

### 構造化ログ
- `Amazon CloudWatch Logs` を採用する

### メトリクス
- `Amazon CloudWatch Metrics` を採用する

### アラーム
- `Amazon CloudWatch Alarms` を採用する

### 高重要度通知
- `Slack Webhook` を採用する

### task 単位 observability
- 少なくとも以下の相関キーをログ / メトリクスへ反映できる構成とする
  - `requestId`
  - `workflowExecutionId`
  - `taskName`
  - `failureCategory`
  - `retryAttempt`

### 設計意図
- workflow 全体より先に task 単位の失敗局所化を説明できるようにする
- 高重要度障害だけを外部通知し、すべての実行イベントを Slack に送らない

## 9. frontend 連携前提のインフラ境界

### この unit で固定するもの
- API Base URL
- `POST /requests`
- `GET /requests/{requestId}`
- frontend が参照する environment variable 名

### 後続 Unit に委ねるもの
- Amplify Hosting の詳細 IaC
- frontend の build / deploy 定義

### 設計意図
- Frontend Unit が実装される前に、接続前提を失わないようにする

## 10. ネットワーク方針

### 基本方針
- MVP では API Gateway を公開入口とする
- AWS managed service 中心で構成し、複雑な VPC 要件は現時点では導入しない

### 内部通信
- `API Gateway -> Lambda`
- `Lambda -> Step Functions`
- `Step Functions -> Lambda`
- `Lambda -> DynamoDB`
- `Lambda -> Secrets Manager`
- `Lambda -> Bedrock AgentCore Runtime`
- `Lambda -> Slack Webhook`

## 11. リソース分離方針

### Unit 単位分離
- 本 unit の主要リソースは unit 単位で管理する
- 例:
  - workflow starter
  - state machine
  - request state store
  - event log store
  - task execution record store
  - secret reference
  - alarm / log group

### 共有インフラ
- 現時点では shared-infrastructure を新設しない
- 将来複数 Unit で共有する通知基盤や API 基盤が明確になった時点で再評価する

## 12. 現段階で見送るもの

### 見送る対象
- マルチリージョン冗長化
- X-Ray など詳細分散トレーシング
- Amplify Hosting の詳細リソース設計
- Bedrock 以外の推論基盤

### 理由
- restarted NFR の MVP 範囲を超える
- まずは task 単位 observability と failure localization を最短で成立させることを優先する

## 拡張ルール適用状況

### Security Baseline
- 状態: N/A
- 理由: `aidlc-state.md` で無効化されている

### Property-Based Testing
- 状態: N/A
- 理由: この段階はインフラ mapping であり、PBT の具体適用は後続の Code Generation / testing で扱う
