# Infrastructure and Operational Support Domain Entities

## Request
休暇交渉全体を表す主エンティティ。

### 主な属性
- `requestId`
- `requesterId`
- `mode`
- `requestedLeaveDate`
- `reasonSummary`
- `currentState`
- `currentOwner`
- `slackThreadRef`
- `calendarApprovalStatus`
- `finalOutcome`
- `createdAt`
- `updatedAt`

### 説明
- `mode` は `絶対休めるモード` または `できれば休みたいモード`
- `currentState` は `受付` / `交渉中` / `要エスカレーション` / `成立` / `不成立` / `登録失敗`
- `currentOwner` は現在の主要担当主体を示し、通常 AI、必要時に弁護士エージェントを含む

## RequestEvent
Request に紐づく時系列イベント。

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
- `NegotiationStarted`
- `SlackMessageSent`
- `SlackReplyReceived`
- `EscalationEvaluated`
- `LawyerEscalationStarted`
- `NegotiationSucceeded`
- `NegotiationRejected`
- `CalendarApprovalRequested`
- `CalendarApprovalGranted`
- `CalendarRegistrationSucceeded`
- `CalendarRegistrationFailed`
- `RetryScheduled`
- `FatalErrorRaised`

## EscalationDecision
弁護士エージェントへのエスカレーション判定結果。

### 主な属性
- `decisionId`
- `requestId`
- `decision`
- `reasonSummary`
- `inputLogRange`
- `decidedAt`

### 説明
- `decision` は `継続` または `要エスカレーション`
- 判定理由は監査できる粒度で保持する

## RetryRecord
一時障害に対する再試行制御情報。

### 主な属性
- `retryId`
- `requestId`
- `targetOperation`
- `attemptNumber`
- `maxAttempts`
- `failureCategory`
- `scheduledAt`
- `finishedAt`
- `result`

### 説明
- `failureCategory` は少なくとも `Transient` と `Business` を持つ
- `result` は `Pending` / `Succeeded` / `Exhausted`

## CalendarApproval
Calendar 登録前の最終確認を表す。

### 主な属性
- `approvalId`
- `requestId`
- `status`
- `promptedAt`
- `answeredAt`
- `answeredBy`

### 説明
- `status` は `Pending` / `Approved` / `Declined`
- `Approved` のときのみ Calendar Registration Unit を起動できる

## AuditEnvelope
監査・可観測性のための補助エンティティ。

### 主な属性
- `requestId`
- `promptSummary`
- `modelDecisionSummary`
- `eventRefs`
- `retryRefs`
- `lastObservedAt`

### 説明
- 内部プロンプトは全文ではなく要約のみ保持する
- 後続 Unit はこの情報を使って Request Detail や障害表示を構築する
