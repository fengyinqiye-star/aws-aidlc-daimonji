# Infrastructure and Operational Support Infrastructure Design

## 概要
本書は、restart 後の `Infrastructure and Operational Support` Unit について、restarted Functional Design と restarted NFR Design を具体的な AWS インフラへ対応付けたものである。対象は公開 API 入口、workflow orchestration、task 実行、Bedrock agent runtime 連携、request tracking、通知、observability である。Amplify Hosting 自体は後続の frontend unit に委ねるが、この Unit では frontend が依存する公開 API 契約を固定する。

## インフラ設計方針

### MVP 方針
- 配置先は単一 AWS リージョンとする。
- custom platform より managed AWS services を優先する。
- Step Functions を workflow control plane の中核に据える。
- 実行粒度は task 単位の Lambda handler を維持し、2 本の coarse Lambda 構成へ戻さない。
- Bedrock AgentCore Runtime は明示的な integration boundary とし、失敗は `AgentRuntimeFailure` として独立分類する。
- `Request State`、`Request Event Log`、`Task Execution Record` は分離し、UI 向け current state と監査履歴を混同しない。

### 採用サービス
- `Amazon API Gateway`
- `AWS Lambda`
- `AWS Step Functions`
- `Amazon DynamoDB`
- `AWS Secrets Manager`
- `Amazon CloudWatch`
- `Amazon Bedrock AgentCore Runtime`
- `Slack Webhook`

## サービス対応

### 公開 API 境界
- `Amazon API Gateway` をこの Unit の唯一の公開入口とする。
- 公開 contract は `POST /requests` と `GET /requests/{requestId}` に限定する。
- internal workflow step は外部 API として露出させない。

### Workflow Starter Lambda
- API Gateway 配下に専用の starter Lambda を置く。
- 責務は request 正規化、初期 status 決定、初期 event 記録、Step Functions 起動に限定する。
- Bedrock 呼び出しや downstream task logic は持たせない。

### Step Functions workflow coordinator
- `AWS Step Functions` が orchestration、retry routing、failure routing、terminal transition を担う。
- restarted baseline の要求に従い、task-level orchestration を前提とする。

### Task Lambda group
- workflow step は task-oriented な Lambda 群へ対応付ける。
- 想定する logical task は以下である。
  - `ExtractVacationIntent`
  - `CheckMissingInformation`
  - `LoadGoogleCalendar`
  - `LoadTeamSchedule`
  - `CalculateVacationScore`
  - `GenerateNegotiationPlan`
  - `GenerateSlackMessage`
  - `PostToSlack`
  - `RegisterCalendarLeave`
  - `UpdateStatus`
  - `ErrorHandler`
- Code Generation では physical handler の統合や分割はあり得るが、infra boundary としては task 単位の failure localization を維持する。

### Bedrock runtime boundary
- `Amazon Bedrock AgentCore Runtime` を専用 runtime dependency として扱う。
- orchestrator agent と lawyer agent の実行は task Lambda からこの boundary を通じて呼び出す。
- Bedrock failure は generic adapter failure に吸収せず独立して扱う。

### Request tracking storage
- 永続化には `Amazon DynamoDB` を採用する。
- 論理的な store は以下の 3 つを維持する。
  - `Request State`
  - `Request Event Log`
  - `Task Execution Record`
- `GET /requests/{requestId}` は `Request State` を primary read model とし、必要時のみ event history を補助参照する。

### Secret management
- Slack webhook などの integration secret は `AWS Secrets Manager` に格納する。
- IAM は必要な task のみに secret access を許可する。
- secret value は logs や event history に出力しない。

### Notifications
- `Slack Webhook` は高重要度の運用通知に限定する。
- routine workflow progress は CloudWatch に留め、Slack へは流さない。
- 1 workflow あたりの alert は集約し、通知スパムを防ぐ。

### Observability
- `Amazon CloudWatch` を logs、metrics、alarms の基盤とする。
- task 単位で以下の追跡 key を保持する。
  - `requestId`
  - `workflowExecutionId`
  - `taskName`
  - `failureCategory`
  - `retryAttempt`
- 主な alarm 候補は task failure count、retry exhaustion、Bedrock runtime failure、terminal workflow failure とする。

### Frontend-facing contract
- この Unit で固定するのは以下である。
  - API base URL
  - `POST /requests`
  - `GET /requests/{requestId}`
  - frontend runtime access 用 environment variable 名
- Amplify Hosting IaC や frontend deploy 詳細は downstream frontend unit の責務とする。

## リソース責務

### この Unit が持つもの
- API Gateway
- Workflow Starter Lambda
- Step Functions state machine
- request tracking 用 DynamoDB resources
- task Lambda group
- CloudWatch log groups、metrics、alarms

### 後続 Unit へ委譲するもの
- Amplify Hosting deploy design
- frontend build / hosting pipeline
- advanced authentication and authorization design
- multi-region deployment
- advanced VPC / private networking design

## この段階で採用しないもの
- マルチリージョン配置
- VPC 前提の閉域ネットワーク
- X-Ray などの追加 distributed tracing
- frontend hosting の詳細 IaC

## Extension Compliance Summary

### Security Baseline
- Status: N/A
- Reason: `aidlc-state.md` で disabled になっているため。

### Property-Based Testing
- Status: N/A
- Reason: 本書は infrastructure mapping を対象とし、PBT の具体適用は Code Generation と test design の責務であるため。
