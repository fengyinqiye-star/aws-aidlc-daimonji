# Infrastructure and Operational Support Domain Entities

## Request
休暇交渉 request 全体の現在状態を表す主エンティティ。

### 主な属性
- `requestId`
- `requesterId`
- `mode`
- `requestedLeaveDate`
- `reasonSummary`
- `currentState`
- `currentOwner`
- `slackThreadRef`
- `reviewStatus`
- `calendarApprovalStatus`
- `finalOutcome`
- `createdAt`
- `updatedAt`

### 説明
- `currentOwner` は現在の主責務主体を示し、`ai`、`lawyer-agent`、`user-review` などを取る
- `reviewStatus` は Slack 投稿前レビューの状態を表す

## RequestEvent
request に紐づく時系列イベント。

### 主な属性
- `eventId`
- `requestId`
- `eventType`
- `stateBefore`
- `stateAfter`
- `summary`
- `detailRef`
- `causedBy`
- `occurredAt`

### 主なイベント種別
- `RequestAccepted`
- `IntentExtracted`
- `MissingInformationDetected`
- `CalendarLoaded`
- `TeamScheduleLoaded`
- `VacationScoreCalculated`
- `NegotiationPlanGenerated`
- `SlackDraftGenerated`
- `ReviewRequested`
- `SlackMessagePosted`
- `SlackReplyReceived`
- `LawyerEscalationRequested`
- `LawyerEscalationStarted`
- `NegotiationApproved`
- `NegotiationRejected`
- `CalendarApprovalRequested`
- `CalendarRegistrationSucceeded`
- `CalendarRegistrationFailed`
- `FatalFailureRaised`

## WorkflowTaskExecution
Step Functions の task 実行結果を保持するエンティティ。

### 主な属性
- `executionId`
- `requestId`
- `taskName`
- `attemptNumber`
- `startedAt`
- `finishedAt`
- `result`
- `failureCategory`
- `errorSummary`

### 説明
- task 単位での成功・失敗を明示し、どこで止まったかを追跡できるようにする

## AgentRuntimeSession
Bedrock AgentCore Runtime 上の agent 実行セッション情報。

### 主な属性
- `sessionId`
- `requestId`
- `agentType`
- `runtimeRef`
- `inputContextRef`
- `startedAt`
- `endedAt`
- `outcome`

### 説明
- `agentType` は `negotiation-orchestrator` または `lawyer-agent`
- `runtimeRef` はランタイム実行または呼び出し先を参照する

## EscalationDecision
Lawyer Agent 参加の判定結果。

### 主な属性
- `decisionId`
- `requestId`
- `decision`
- `reasonSummary`
- `inputLogRange`
- `decidedAt`

### 説明
- `decision` は `continue` または `escalate`
- 判定根拠は event log と交渉ログから参照可能とする

## RetryRecord
自動再試行の実行記録。

### 主な属性
- `retryId`
- `requestId`
- `taskName`
- `attemptNumber`
- `maxAttempts`
- `failureCategory`
- `scheduledAt`
- `finishedAt`
- `result`

### 説明
- `failureCategory` は `TransientFailure`、`BusinessFailure`、`IntegrationFailure`、`AgentRuntimeFailure`、`FatalFailure`

## CalendarApproval
Calendar 登録前の最終確認情報。

### 主な属性
- `approvalId`
- `requestId`
- `status`
- `promptedAt`
- `answeredAt`
- `answeredBy`

### 説明
- `status` は `pending`、`approved`、`declined`

## FrontendRuntimeContract
Frontend Unit が Amplify Hosting から利用する公開 API 契約情報。

### 主な属性
- `contractId`
- `apiBaseUrl`
- `startRequestEndpoint`
- `getRequestEndpoint`
- `requiredEnvironmentVariables`
- `contractVersion`

### 説明
- Amplify の詳細 IaC は持たないが、接続前提を先に固定するための契約である

## Testable Properties

### WorkflowTaskExecution
- Category: `Invariant`
- Property: `taskName` は FR-09 対応の定義済みタスクリストに属する

### FrontendRuntimeContract
- Category: `Round-trip`
- Property: contract を JSON 化して復元しても endpoint と environment variable の集合が保持される
