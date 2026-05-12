# Infrastructure and Operational Support Business Logic Model

## 目的
この Unit は、有休交渉 MVP 全体を支える実行基盤とワークフロー制御を担う。再始動後の Functional Design では、単なる API 受付基盤ではなく、Inception で合意した以下の責務を実現することを目的とする。

- Step Functions による論理ステップ単位のオーケストレーション
- 交渉オーケストレータ Agent と弁護士 Agent の実行境界管理
- API / frontend / workflow / adapter 間の状態同期
- 障害箇所を特定しやすいタスク粒度と監査ログ管理
- 将来の Frontend Unit が Amplify Hosting から利用する公開 API 境界の提供
- フェーズ乖離監視オートメーションの実行土台

## 論理コンポーネント

### 1. Public Entry Gateway
- フロントエンドまたは外部クライアントからの要求を受け付ける。
- `POST /requests` と `GET /requests/{requestId}` を最小公開 API とする。
- Frontend Unit へは Amplify Hosting から参照される前提の API 契約と環境変数を提供する。

### 2. Workflow Entry Lambda
- Public Entry Gateway からの要求を受け、初期 Request を作成する。
- Step Functions 実行に必要な初期 payload を構築する。
- 長時間処理や交渉判断は持たず、ワークフロー開始責務に限定する。

### 3. Workflow State Coordinator
- FR-09 に近い粒度で Step Functions のタスク連鎖を制御する。
- 分岐、待機、再試行、タイムアウト、FATAL 遷移を集中管理する。
- 各 task Lambda や Agent Runtime を呼び出す順序と条件を決定する。

### 4. Task Lambda Layer
- 各論理ステップを独立した task Lambda として実行する。
- 失敗時に「どの業務ステップで止まったか」が Step Functions 上で明確になる。
- 初期対象は以下の logical task 群とする。
  - `ExtractVacationIntentTask`
  - `CheckMissingInformationTask`
  - `LoadGoogleCalendarTask`
  - `LoadTeamScheduleTask`
  - `CalculateVacationScoreTask`
  - `GenerateNegotiationPlanTask`
  - `GenerateSlackMessageTask`
  - `PostToSlackTask`
  - `RegisterCalendarLeaveTask`
  - `UpdateStatusTask`
  - `ErrorHandlerTask`

### 5. Negotiation Orchestrator Agent Runtime
- Bedrock AgentCore Runtime 上で稼働する交渉オーケストレータ Agent を表す。
- 交渉判断、会話制御、モード差分に応じた戦略決定を担う。
- Step Functions から必要な文脈を受け取り、業務判断結果を返す。

### 6. Lawyer Agent Runtime
- Bedrock AgentCore Runtime 上で稼働する弁護士 Agent を表す。
- `絶対休めるモード` で必要時にのみ参加する。
- 交渉スレッド文脈を受け取り、法務観点の助言と更新方針を返す。

### 7. Request Tracking Backbone
- 現在状態、イベントログ、実行履歴、再試行履歴の単一参照元とする。
- Frontend、Chat Intake、Negotiation、Calendar Registration の各 Unit が同じ状態ソースを参照できるようにする。

### 8. Phase Drift Monitor
- Inception / Construction / Operations の成果物と現実装の乖離を定期確認する。
- 新規の重大乖離を `Finding` として記録し、Issue 化候補へ変換する。
- 初期運用は毎日 1 回の cron 実行を前提とする。

## オーケストレーション原則
- Step Functions は「順序制御」「分岐」「待機」「再試行」「失敗分類」を担当する。
- 業務判断は task Lambda または Agent Runtime の返却値として扱い、State Machine に過度なドメインロジックを埋め込まない。
- Agent Runtime は Bedrock AgentCore Runtime に配置し、Step Functions からタスクとして呼び出される。
- API entry Lambda と task Lambda は明確に分離する。
- 読み取り API は write 系ワークフローから独立した Lambda として保つ。

## ワークフロー状態モデル

### 主要状態
1. `DRAFT`
2. `COLLECTING_INFO`
3. `ANALYZING`
4. `REVIEW_REQUIRED`
5. `NEGOTIATING`
6. `ESCALATED`
7. `APPROVED`
8. `NEEDS_REPLAN`
9. `FAILED`

### 状態モデルの意図
- Inception の FR-08 に合わせて、UI 表示と workflow control の両方に使える状態名を採用する。
- Step Functions の中間的な task 失敗や待機は、状態名の乱立ではなく execution/event log で表現する。
- 交渉成立後の Calendar 登録成功は `APPROVED` を維持し、登録失敗時は `FAILED` とイベント種別で補完する。

## FR-09 対応の論理ステップモデル

### フロー 1: Request 起動
1. `ReceiveChatMessage`
2. `ExtractVacationIntent`
3. `CheckMissingInformation`
4. 情報不足なら `COLLECTING_INFO` に更新して待機
5. 情報充足なら `ANALYZING` に進む

### フロー 2: 予定分析
1. `LoadGoogleCalendar`
2. `LoadTeamSchedule`
3. `CalculateVacationScore`
4. `GenerateNegotiationPlan`

補足:
- スコア自体は UI 表示要件ではないが、交渉戦略生成の内部入力として保持する。

### フロー 3: Slack 投稿準備
1. `GenerateSlackMessage`
2. `UpdateStatus(REVIEW_REQUIRED)`
3. `WaitForUserReview`
4. 承認後に `PostToSlack`
5. `UpdateStatus(NEGOTIATING)`

### フロー 4: 交渉継続とエスカレーション
1. 新しい交渉ログ受信時に `GenerateNegotiationPlan` 相当の再判断を行う
2. `絶対休めるモード` かつ必要時に Negotiation Orchestrator Agent が弁護士 Agent 参加を要求する
3. Workflow State Coordinator が `ESCALATED` を記録し、Lawyer Agent Runtime を呼び出す
4. 同一スレッド文脈を維持したまま交渉継続

### フロー 5: 成立後処理
1. 交渉成立時に `UpdateStatus(APPROVED)`
2. `RegisterCalendarLeave`
3. 登録成功で `APPROVED` 維持
4. 登録失敗時は `ErrorHandler` と `UpdateStatus(FAILED)`

## 失敗制御モデル

### 失敗カテゴリ
- `TransientFailure`
- `BusinessFailure`
- `IntegrationFailure`
- `AgentRuntimeFailure`
- `FatalFailure`

### 制御方針
- `TransientFailure` は Step Functions Retry / Backoff の対象とする。
- `BusinessFailure` は再試行せず、UI へ説明付きで返す。
- `IntegrationFailure` はアダプタ別に記録し、デモフォールバックの可否を判定する。
- `AgentRuntimeFailure` は Bedrock 実行失敗として分類し、テンプレートベースまたは人手レビューへフォールバックする余地を残す。
- `FatalFailure` は execution を停止し、原因 task と再開不能理由を明示する。

## Amplify Hosting との論理接続
- Amplify Hosting の詳細なリソース定義は Frontend Unit へ委ねる。
- ただし本 Unit は、frontend が参照すべき以下を契約として先に定義する。
  - 公開 API Base URL
  - 読み取り用 request status endpoint
  - workflow 起動 endpoint
  - 必要な runtime environment variable 名

## フェーズ乖離監視フロー
1. Automation Run が `aidlc-state.md` を読む
2. 現在フェーズに応じて Inception / Construction / Operations の成果物を読む
3. repository structure / code / Terraform / runbook と期待値を比較する
4. `Blocking` または `Material` の乖離を抽出する
5. GitHub Issue 候補へ変換し、既存 open issue の有無を確認する
6. 新規 issue 作成または既存 issue 更新を行う

## Testable Properties

### PBT-01 対象分析
- **Workflow state transitions**
  - Category: `Invariant`
  - Property: 定義済み状態遷移以外は許可されない
- **Retry scheduling**
  - Category: `Idempotence`
  - Property: 同じ retry exhaustion 判定を重複適用しても最終 failure state は変わらない
- **Request / event projection**
  - Category: `Round-trip`
  - Property: event log から構成される state projection を serialize / deserialize しても論理状態が保持される
- **Drift severity classification**
  - Category: `Range constraints`
  - Property: 乖離分類は `Blocking / Material / Minor` のいずれかに必ず収まる

### PBT 不適用項目
- Bedrock AgentCore Runtime 自体の外部実行は、この段階では Functional Design 上の責務定義であり、直接的な property test 対象ではない。
