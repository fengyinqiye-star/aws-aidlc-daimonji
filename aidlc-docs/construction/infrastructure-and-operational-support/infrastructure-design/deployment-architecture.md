# Infrastructure and Operational Support Deployment Architecture

## 概要
本書は、restarted `Infrastructure and Operational Support` Unit の deployment topology、request flow、failure path、observability placement を示す。MVP 前提は単一リージョン、managed service 中心、downstream frontend が利用する公開 API contract の固定である。

## 論理トポロジ

```text
Frontend / External Client
  |
  v
Amazon API Gateway
  |
  v
Workflow Starter Lambda
  |
  v
AWS Step Functions State Machine
  |
  +--> Task Lambda Group
  |       |
  |       +--> Amazon Bedrock AgentCore Runtime
  |       +--> AWS Secrets Manager
  |       +--> Amazon CloudWatch Logs / Metrics
  |
  +--> DynamoDB Request State
  +--> DynamoDB Request Event Log
  +--> DynamoDB Task Execution Record
  |
  +--> CloudWatch Alarms
          |
          v
      Slack Webhook
```

## リクエストフロー

### `POST /requests`
1. client が API Gateway に request を送る。
2. API Gateway が Workflow Starter Lambda へ転送する。
3. starter が payload を正規化し、初期 state と初期 event を記録する。
4. starter が Step Functions state machine を起動する。
5. API は workflow 完了を待たず、async start を示す最小 response を返す。

### workflow execution
1. Step Functions が task Lambda を step 単位で順次実行する。
2. Bedrock 利用 task は専用 runtime boundary を通じて Amazon Bedrock AgentCore Runtime を呼び出す。
3. 各 step は `Request State`、`Request Event Log`、`Task Execution Record` を必要に応じて更新する。
4. step 単位の logs と metrics を出力しつつ、workflow は continue、retry、fallback、terminal failure のいずれかへ進む。

### `GET /requests/{requestId}`
1. client が API Gateway 経由で read request を送る。
2. read path は primary read model である current state を返す。
3. 詳細 explanation や audit detail が必要な場合のみ event history を補助参照する。

## 失敗処理アーキテクチャ

### `TransientFailure`
- Step Functions の retry/backoff policy で処理する。
- retry attempt 情報は task execution metadata と observability logs に残す。

### `AgentRuntimeFailure`
- Bedrock runtime failure として独立分類を維持する。
- bounded retry 後は human review または escalation path へ進める。

### `FatalFailure`
- request state を terminal failure に更新する。
- UI-facing failure information は current state に保持する。
- 高重要度 alarm のみ CloudWatch Alarm 経由で Slack Webhook へ relay する。

## データ配置

### `Request State`
- UI と public API read のための primary current-state store。

### `Request Event Log`
- status change、retry、escalation、主要 business event を保持する audit-oriented history。

### `Task Execution Record`
- failure localization と retry analysis のための step-level execution metadata。

## 通知と observability の配置

### CloudWatch
- task-level logs を保持する。
- task failure、retry、Bedrock runtime failure、terminal workflow failure を metrics 化する。
- significant operational condition に対してのみ alarm を発火させる。

### Slack Webhook
- high-severity operational notification のみ受け取る。
- routine workflow progress は mirror しない。

## 環境戦略

### MVP environment model
- 本 Unit は MVP では single-environment path を前提とする。
- 明確な `dev` / `prod` 分離や `stg` 追加は、core topology を変えずに後から拡張できる。

### naming guidance
- unit resource には安定した prefix を付ける。
- 例:
  - `infra-support-api`
  - `infra-support-workflow-starter`
  - `infra-support-state-machine`
  - `infra-support-request-state`
  - `infra-support-request-events`
  - `infra-support-task-records`
  - `infra-support-alerts`

## frontend 境界

### この Unit で固定するもの
- API base URL
- `POST /requests`
- `GET /requests/{requestId}`
- frontend runtime environment variable 名

### downstream frontend work へ残すもの
- Amplify Hosting build / deploy design
- frontend routing と asset delivery
- hosting environment differentiation

## restarted baseline との整合
- Bedrock を明示的な infrastructure boundary として復帰させている。
- Step Functions を coarse pass-through ではなく task-granular orchestration の中核へ戻している。
- task-level Lambda decomposition を前提とした execution model を維持している。
- current state、event log、task execution record の 3 層 request tracking を保持している。
- frontend 向け public contract をこの Unit で固定し、Amplify Hosting 詳細は downstream unit に分離している。

## Extension Compliance Summary

### Security Baseline
- Status: N/A
- Reason: `aidlc-state.md` で disabled になっているため。

### Property-Based Testing
- Status: N/A
- Reason: 本書は deployment architecture を対象とし、PBT の具体適用は Code Generation と test design の責務であるため。
