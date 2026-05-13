# Infrastructure and Operational Support デプロイアーキテクチャ

## 概要
本書は、restart 後の `Infrastructure and Operational Support` Unit を単一リージョン MVP としてどのように配置するかを整理する。対象は公開 API 入口、workflow orchestration、task 実行、Bedrock agent runtime 呼び出し、request tracking、observability、運用通知である。

## 1. 配置方針

### MVP 配置
- 単一 AWS リージョンに配置する
- AWS managed service を優先し、運用負荷を増やすネットワーク設計は後回しにする

### 主な採用サービス
- `Amazon API Gateway`
- `AWS Lambda`
- `AWS Step Functions`
- `Amazon DynamoDB`
- `AWS Secrets Manager`
- `Amazon CloudWatch`
- `Amazon Bedrock AgentCore Runtime`
- `Slack Webhook`

## 2. 配置図

```text
Frontend / External Client
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
  |  +--> Task Lambda群
  |         |
  |         +--> Bedrock AgentCore Runtime
  |         +--> Secrets Manager
  |         +--> CloudWatch Logs / Metrics
  |
  +--> DynamoDB (Request State)
  +--> DynamoDB (Request Event Log)
  +--> DynamoDB (Task Execution Record)
  |
  +--> CloudWatch Alarms
             |
             v
        Slack Webhook
```

## 3. コンポーネントごとの配置

### API Gateway
- frontend 向け公開入口
- 外部クライアントが直接触る唯一の HTTP 境界

### Workflow Starter Lambda
- request 受理後の初期化専用
- 初期 state 作成
- 初回 event 記録
- Step Functions 起動

### Step Functions State Machine
- workflow 全体の orchestration を担当
- retry / backoff
- 分岐
- 待機
- terminal state 遷移

### Task Lambda 群
- workflow step ごとの処理を担当
- coarse-grained な 2 本構成には戻さない
- Bedrock 呼び出しを含む task は独立に観測可能にする

### Bedrock AgentCore Runtime
- orchestrator agent / lawyer agent の実行基盤
- 一般 task 実行から遅延と障害を切り離す

### DynamoDB
- Request State
- Request Event Log
- Task Execution Record

### Secrets Manager
- Slack Webhook などの secret を解決する

### CloudWatch
- task 単位ログ
- task 単位メトリクス
- 高重要度障害アラーム

### Slack Webhook
- 高重要度障害の運用通知先
- 主 workflow の成否とは分離する

## 4. リクエストフロー

### `POST /requests`
1. API Gateway が request を受け取る
2. Workflow Starter Lambda が request を正規化する
3. Request State と初回 Event を記録する
4. Step Functions を起動する
5. API 呼び出し元へ早期応答を返す

### workflow 実行中
1. Step Functions が task Lambda 群を step 単位で制御する
2. Bedrock 利用 task は AgentCore Runtime を呼ぶ
3. current state / event log / task execution record が更新される
4. 障害分類に応じて retry / explicit failure / fallback が決まる

### `GET /requests/{requestId}`
1. API Gateway 経由で read パスに入る
2. current state を主に参照する
3. 必要に応じて event log を補助的に参照する

## 5. 障害時アーキテクチャ

### `TransientFailure`
- Step Functions 側の retry / backoff で吸収する
- retry 情報は task execution record と構造化ログに残す

### `AgentRuntimeFailure`
- Bedrock 経路の障害として独立分類する
- retry 可能なら bounded retry
- そうでなければ human review / escalation 経路へ送る

### `FatalFailure`
- current state を terminal failure へ更新する
- UI 表示用状態を確定する
- 高重要度なら Slack 通知を送る
- Slack 通知失敗で workflow 全体を再失敗させない

## 6. 可観測性アーキテクチャ

### 構造化ログ
- すべての主要 task は構造化ログを出す
- ログは少なくとも以下を持つ
  - `requestId`
  - `workflowExecutionId`
  - `taskName`
  - `failureCategory`
  - `retryAttempt`

### メトリクス
- task 成功 / 失敗
- retry 回数
- Bedrock 呼び出し成否
- terminal failure 件数

### アラーム
- 高重要度障害のみ対象
- task 単位での局所化を説明できる粒度にする

## 7. frontend との接続境界

### この unit で固定するもの
- API Base URL
- `POST /requests`
- `GET /requests/{requestId}`
- frontend 用 environment variable 名

### 後続に残すもの
- Amplify Hosting の実リソース定義
- frontend build / deploy の詳細

## 8. 命名 / 分離の考え方

### 命名例
- `infra-support-api`
- `infra-support-workflow-starter`
- `infra-support-state-machine`
- `infra-support-request-state`
- `infra-support-request-events`
- `infra-support-task-records`
- `infra-support-alerts`

### 分離方針
- unit 単位の責務境界を infrastructure 名にも反映する
- 共有基盤が未確定な段階では、無理に shared resource へ寄せない

## 9. 今回見送る配置

### 見送るもの
- マルチリージョン
- VPC を前提にした複雑な閉域設計
- 詳細分散トレーシング
- Amplify Hosting の詳細配置

### 理由
- restarted baseline の MVP 範囲外である
- まずは Bedrock を含む task 単位 orchestration と observability を成立させることが先である

## 拡張ルール適用状況

### Security Baseline
- 状態: N/A
- 理由: `aidlc-state.md` で無効化されている

### Property-Based Testing
- 状態: N/A
- 理由: 本書は deployment mapping を扱う段階であり、PBT の具体実装対象ではない
