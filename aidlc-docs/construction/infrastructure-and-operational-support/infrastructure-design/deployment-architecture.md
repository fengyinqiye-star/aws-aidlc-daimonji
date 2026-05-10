# Infrastructure and Operational Support デプロイアーキテクチャ

## 概要
本書は `Infrastructure and Operational Support` Unit のデプロイ構成を示す。MVP では AWS 上の単一環境を前提とし、公開入口からワークフロー実行、状態保存、ログ、通知までの実行経路を定義する。

## 1. 配置方針

### 環境
- MVP は単一環境で構成する。
- 後続フェーズで `dev` / `stg` / `prod` へ拡張できるよう、命名と構成の一貫性を持たせる。

### AWS サービス配置
- 公開入口: `Amazon API Gateway`
- API 起動処理: `AWS Lambda`
- ワークフロー制御: `AWS Step Functions`
- 現在状態保存: `Amazon DynamoDB`
- イベントログ保存: `Amazon DynamoDB`
- 秘密情報管理: `AWS Secrets Manager`
- ログ/メトリクス/アラーム: `Amazon CloudWatch`
- 高重要度障害通知: `Slack Webhook`

## 2. 実行アーキテクチャ

```text
Frontend
  |
  v
API Gateway
  |
  v
Workflow Starter Lambda
  |
  v
Step Functions State Machine
  | \
  |  \--> DynamoDB (Request State)
  |   \
  |    \-> DynamoDB (Event Log)
  |
  +--> Task Lambdas / Adapters
           |
           +--> Secrets Manager
           +--> CloudWatch Logs / Metrics
           +--> Slack Webhook (high severity only)
```

## 3. コンポーネント別デプロイ責務

### API Gateway
- フロント向けの公開 HTTP エンドポイントを提供する。
- MVP では最小限の API 群のみを公開する。

### Workflow Starter Lambda
- 入口 API の処理を受け、初期 `Request` 作成と Step Functions 起動を行う。
- 長時間処理は持たず、オーケストレーション開始に責務を限定する。

### Step Functions State Machine
- Retry / Backoff
- 分岐
- 待機
- `FATAL` への遷移
- 後続 Lambda 呼び出し

### DynamoDB
- `Request State` と `Event Log` を格納する。
- 単一ストア上で責務分離を行う。

### Secrets Manager
- Slack Webhook などの秘匿情報を保持する。

### CloudWatch
- ログ、メトリクス、アラームを集約する。

## 4. 障害時のデプロイ上の振る舞い

### 一時障害
- Step Functions の Retry / Backoff で吸収する。
- Retry 試行は CloudWatch Logs と Event Log に残す。

### FATAL 障害
- UI 側の失敗表示を優先する。
- 高重要度障害は Slack Webhook へ通知する。
- 通知失敗は主フロー失敗へ昇格させない。

## 5. 命名・分離方針

### 命名
- Unit 名を含む命名を基本とする。
- 例:
  - `infra-support-workflow-starter`
  - `infra-support-state-machine`
  - `infra-support-request-state`
  - `infra-support-event-log`
  - `infra-support-secrets`

### 分離
- AWS アカウントおよびネットワークは共有前提
- リソース識別と責務境界は Unit 単位で明確化

## 6. 将来拡張ポイント
- 複数環境化
- API Gateway 認証追加
- CloudWatch ダッシュボード追加
- X-Ray などのトレーシング追加
- Slack 以外の通知チャネル追加
- 一部ワークロードのコンテナ実行基盤移行
