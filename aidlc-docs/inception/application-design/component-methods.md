# コンポーネントメソッド定義

## Chat Interaction Component

### `submitUserMessage(sessionId: string, message: string): Promise<void>`
- ユーザー入力を送信し、チャット進行を開始する。

### `submitCalendarRegistrationDecision(requestId: string, approved: boolean): Promise<void>`
- チャット内で提示された Calendar 登録確認に対する応答を送信する。

## Negotiation Workspace Component

### `renderNegotiationSummary(requestId: string): Promise<NegotiationSummaryViewModel>`
- 交渉要約表示用データを取得して描画する。

### `renderRequestStatus(requestId: string): Promise<RequestStatusViewModel>`
- リクエスト状態履歴を表示する。

## Slack Review Component

### `loadSlackDraft(requestId: string): Promise<SlackDraftViewModel>`
- レビュー対象の Slack 投稿ドラフトを取得する。

### `updateSlackDraft(requestId: string, draft: SlackDraftInput): Promise<void>`
- 投稿文編集内容を保存する。

### `approveSlackPost(requestId: string): Promise<void>`
- Slack 投稿承認を送信する。

## Chat Workflow Service

### `startChatSession(userId: string): Promise<ChatSession>`
- 新規チャットセッションを開始する。

### `handleIncomingMessage(sessionId: string, message: UserMessage): Promise<WorkflowResponse>`
- ユーザー入力を受け取り、次のワークフロー応答を返す。

### `requestMissingInformation(requestId: string, missingFields: string[]): Promise<SystemMessage>`
- 不足情報確認用のメッセージを作成する。

### `appendSystemMessage(sessionId: string, message: SystemMessage): Promise<void>`
- システムメッセージを会話履歴へ追記する。

## Negotiation Analysis Service

### `analyzeVacationRequest(requestId: string): Promise<NegotiationAnalysis>`
- 予定情報と入力情報を元に交渉分析を実行する。

### `calculateNegotiationInputs(requestId: string): Promise<NegotiationInputs>`
- スコアリング、影響度、代替担当候補など内部判断用の入力を組み立てる。

### `buildNegotiationStrategy(requestId: string, mode: VacationMode): Promise<NegotiationStrategy>`
- モード別の交渉方針を生成する。

### `buildNegotiationFeedback(requestId: string, outcome: NegotiationOutcome): Promise<NegotiationFeedback>`
- 不成立時または成立時の返答要約を整形する。

## Escalation Coordination Service

### `evaluateEscalationNeed(requestId: string, conversation: NegotiationConversation): Promise<EscalationDecision>`
- 交渉のやり取り内容を元に弁護士エージェント参加要否を判断する。

### `startLawyerAgentParticipation(requestId: string, threadContext: SlackThreadContext): Promise<AgentParticipationResult>`
- 弁護士サブエージェントを起動し、交渉スレッド参加コンテキストを渡す。

### `updateStrategyAfterEscalation(requestId: string): Promise<NegotiationStrategy>`
- エスカレーション後の交渉方針を更新する。

## Slack Negotiation Service

### `generateSlackDraft(requestId: string): Promise<SlackDraft>`
- 投稿レビュー用の Slack ドラフトを生成する。

### `prepareSlackReview(requestId: string): Promise<ReviewState>`
- レビュー待ち状態へ遷移するための情報を整える。

### `postNegotiationThread(requestId: string, draft: SlackDraft): Promise<SlackPostResult>`
- Slack スレッドへ投稿を実行する。

### `recordSlackPostResult(requestId: string, result: SlackPostResult): Promise<void>`
- 投稿結果を記録する。

## Calendar Registration Service

### `prepareCalendarRegistration(requestId: string): Promise<CalendarRegistrationDraft>`
- 登録候補内容を生成する。

### `requestCalendarRegistrationConfirmation(requestId: string): Promise<SystemMessage>`
- チャット内で Calendar 登録確認メッセージを生成する。

### `registerLeaveToCalendar(requestId: string, registration: CalendarRegistrationDraft): Promise<CalendarRegistrationResult>`
- Google Calendar へ休暇予定を登録する。

### `recordCalendarRegistrationResult(requestId: string, result: CalendarRegistrationResult): Promise<void>`
- 登録結果を保存する。

## Request Tracking Service

### `createVacationRequest(sessionId: string, extractedIntent: VacationIntent): Promise<VacationRequest>`
- 新規休暇リクエストを作成する。

### `updateRequestStatus(requestId: string, status: RequestStatus): Promise<void>`
- ステータス遷移を記録する。

### `saveGeneratedArtifacts(requestId: string, artifacts: GeneratedArtifacts): Promise<void>`
- ドラフト、分析結果、フィードバックなどを保存する。

### `loadRequestDetail(requestId: string): Promise<RequestDetailViewModel>`
- Request Detail 画面向け集約データを取得する。

## Adapter Layer

### `SlackAdapter.postThreadMessage(input: SlackThreadMessageInput): Promise<SlackPostResult>`
- Slack スレッド投稿を抽象化する。

### `GoogleCalendarAdapter.createLeaveEvent(input: CalendarEventInput): Promise<CalendarRegistrationResult>`
- Google Calendar 休暇予定登録を抽象化する。

### `TeamScheduleAdapter.loadTeamSchedules(input: TeamScheduleQuery): Promise<TeamSchedule[]>`
- チーム予定取得を抽象化する。

### `AgentRuntimeAdapter.invokeLawyerAgent(input: LawyerAgentInvocation): Promise<AgentParticipationResult>`
- 弁護士エージェント起動を抽象化する。

## Workflow Orchestration Layer

### `dispatchWorkflowStep(stepName: WorkflowStepName, requestId: string): Promise<WorkflowStepResult>`
- Step Functions から呼ばれる処理ディスパッチを行う。

### `resumeFromReview(requestId: string, reviewAction: ReviewAction): Promise<WorkflowStepResult>`
- 人手レビュー後にワークフローを再開する。

### `advanceAfterNegotiationOutcome(requestId: string, outcome: NegotiationOutcome): Promise<WorkflowStepResult>`
- 交渉結果に応じて次ステップを決定する。
