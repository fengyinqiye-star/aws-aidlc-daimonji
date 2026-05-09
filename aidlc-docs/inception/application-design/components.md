# コンポーネント定義

## 1. Chat Interaction Component

### 目的
ユーザーとのチャット入力、会話表示、確認プロンプト表示を担当するフロントエンド機能コンポーネント群。

### 責務
- 自然文入力の受付
- チャット履歴の表示
- AI からの追加質問および確認メッセージの表示
- ネゴシエーション結果フィードバックの表示
- Calendar 登録確認のチャット内応答受付

### 主なインターフェース
- `submitUserMessage`
- `renderConversation`
- `renderConfirmationPrompt`
- `submitCalendarRegistrationDecision`

## 2. Negotiation Workspace Component

### 目的
交渉要約、影響会議、代替担当候補、推奨戦略、現在ステータスを表示するフロントエンド機能コンポーネント群。

### 責務
- ネゴシエーションサマリーの表示
- モード別の現在方針の表示
- ステータス履歴の表示
- Slack 投稿準備状態と Calendar 登録状態の表示

### 主なインターフェース
- `renderNegotiationSummary`
- `renderRequestStatus`
- `renderCalendarRegistrationStatus`

## 3. Slack Review Component

### 目的
Slack 投稿文のレビュー、編集、送信判断を扱うフロントエンド機能コンポーネント。

### 責務
- 投稿文ドラフトの表示と編集
- メンション対象、投稿先、スレッド文脈の表示
- 投稿可否の判断 UI 提供

### 主なインターフェース
- `loadSlackDraft`
- `updateSlackDraft`
- `approveSlackPost`
- `cancelSlackPost`

## 4. Chat Workflow Service

### 目的
チャット起点のリクエスト受付と会話進行制御を担うアプリケーションサービス。

### 責務
- チャットセッション開始
- 入力メッセージ解釈の起点提供
- 不足情報収集フローの制御
- チャット応答生成の流れ管理

### 主なインターフェース
- `startChatSession`
- `handleIncomingMessage`
- `requestMissingInformation`
- `appendSystemMessage`

## 5. Negotiation Analysis Service

### 目的
有休交渉の分析、方針生成、モード差分処理を担うアプリケーションサービス。

### 責務
- 休暇意図抽出結果の受理
- 予定情報とチーム状況の分析
- スコアリングと業務影響分類の内部実行
- モード別の交渉方針生成
- `できれば休みたいモード` の不成立時フィードバック整形

### 主なインターフェース
- `analyzeVacationRequest`
- `calculateNegotiationInputs`
- `buildNegotiationStrategy`
- `buildNegotiationFeedback`

## 6. Escalation Coordination Service

### 目的
弁護士サブエージェントの起動判断と参加制御を担うアプリケーションサービス。

### 責務
- 交渉ログに基づくエスカレーション判断
- 弁護士サブエージェント起動要求
- 交渉スレッド参加コンテキストの引き渡し
- エスカレーション後の戦略更新

### 主なインターフェース
- `evaluateEscalationNeed`
- `startLawyerAgentParticipation`
- `updateStrategyAfterEscalation`

## 7. Slack Negotiation Service

### 目的
Slack 投稿文生成、投稿レビュー連携、スレッド投稿処理を担うアプリケーションサービス。

### 責務
- Slack 投稿文ドラフト生成
- 投稿レビュー状態への遷移制御
- Slack スレッド投稿
- 投稿結果の記録

### 主なインターフェース
- `generateSlackDraft`
- `prepareSlackReview`
- `postNegotiationThread`
- `recordSlackPostResult`

## 8. Calendar Registration Service

### 目的
交渉成立後の Calendar 登録確認および登録処理を担うアプリケーションサービス。

### 責務
- Calendar 登録候補内容の生成
- チャット内確認フローの開始
- Google Calendar 登録実行
- 登録結果の保存

### 主なインターフェース
- `prepareCalendarRegistration`
- `requestCalendarRegistrationConfirmation`
- `registerLeaveToCalendar`
- `recordCalendarRegistrationResult`

## 9. Request Tracking Service

### 目的
ワークフロー状態、成果物、履歴の永続化と参照を担うアプリケーションサービス。

### 責務
- リクエスト状態遷移の記録
- チャット履歴と生成成果物の永続化
- Slack 投稿履歴、Calendar 登録履歴の保持
- Request Detail 表示用データの集約

### 主なインターフェース
- `createVacationRequest`
- `updateRequestStatus`
- `saveGeneratedArtifacts`
- `loadRequestDetail`

## 10. Adapter Layer

### 目的
外部依存をコアロジックから分離するための抽象化レイヤー。

### 含まれる Adapter
- `SlackAdapter`
- `GoogleCalendarAdapter`
- `TeamScheduleAdapter`
- `ObservabilityAdapter`
- `AgentRuntimeAdapter`

### 責務
- 外部 API 呼び出しの抽象化
- 実アダプタとデモ用アダプタの差し替え
- 外部障害時のエラー正規化

## 11. Workflow Orchestration Layer

### 目的
Step Functions からアプリケーションサービス群を順序制御する統合レイヤー。

### 責務
- ワークフロー状態遷移管理
- サービス呼び出し順序の制御
- 人手レビュー待ち状態の保持
- Calendar 登録フローへの遷移

### 主なインターフェース
- `dispatchWorkflowStep`
- `resumeFromReview`
- `advanceAfterNegotiationOutcome`
