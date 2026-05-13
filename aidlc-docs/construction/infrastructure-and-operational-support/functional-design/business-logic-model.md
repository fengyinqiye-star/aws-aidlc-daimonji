# Infrastructure and Operational Support Business Logic Model

## 目的
この Unit は、休暇交渉 MVP のワークフロー制御と実行基盤の責務を定義する。
再始動後の Functional Design では、Inception で承認済みの以下を満たすことを目的とする。

- Step Functions を FR-09 相当の論理ステップで分解する
- Bedrock AgentCore Runtime 上の交渉オーケストレータ Agent と弁護士 Agent の実行境界を定義する
- API / frontend / workflow / adapter の責務境界を明確にする
- タスク単位で失敗箇所が追跡できる構成にする
- 後続の Frontend Unit が Amplify Hosting から利用する公開 API 契約を定義する

## 論理コンポーネント

### 1. Public Entry Gateway
- フロントエンドまたは将来のクライアントからの HTTP リクエストを受け付ける
- `POST /requests` と `GET /requests/{requestId}` を公開 API とする
- Frontend Unit へは Amplify Hosting から参照される前提の API 境界を提供する

### 2. Workflow Entry Lambda
- Public Entry Gateway からの入力を受け、初期 `Request` を作成する
- Step Functions 開始に必要な最小 payload を構成する
- 長時間処理や交渉判断は持たず、ワークフロー開始の責務に限定する

### 3. Workflow State Coordinator
- FR-09 に沿った粒度で Step Functions の状態遷移を制御する
- 分岐、再試行、待機、失敗終端を管理する
- task Lambda と Agent Runtime を呼び分け、実行順序を保証する

### 4. Task Lambda Layer
- 各論理ステップを個別の task Lambda として実行する
- 失敗時にどのステップで問題が起きたかを Step Functions 上で即座に識別できるようにする
- 最低限の logical task は次とする
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
- Bedrock AgentCore Runtime 上で交渉オーケストレータ Agent を実行する
- 休暇交渉判断、理由整理、モード別方針の生成を担う
- Step Functions から必要な場面でのみ呼び出される

### 6. Lawyer Agent Runtime
- Bedrock AgentCore Runtime 上で弁護士 Agent を実行する
- `絶対休めるモード` で必要になった場合のみ参加する
- 法務観点の助言と文面方針の補強を行う

### 7. Request Tracking Backbone
- 現在状態、イベントログ、ステップ実行結果を一貫して保持する
- Frontend、Chat Intake、Negotiation、Calendar Registration の各 Unit が参照できるようにする

## オーケストレーション原則
- Step Functions は「状態遷移」「分岐」「待機」「再試行」を担う
- task Lambda は「個別ステップ処理」を担う
- Agent Runtime は Bedrock AgentCore Runtime に配置し、Step Functions から必要時にのみ呼び出す
- API entry Lambda と task Lambda は明確に分離する
- 読み取り API は write ワークフローから独立した軽量経路で提供する

## ワークフロー状態モデル

### 主状態
1. `DRAFT`
2. `COLLECTING_INFO`
3. `ANALYZING`
4. `REVIEW_REQUIRED`
5. `NEGOTIATING`
6. `ESCALATED`
7. `APPROVED`
8. `NEEDS_REPLAN`
9. `FAILED`

### 状態モデルの考え方
- Inception の FR-08 に合わせ、UI 表示と workflow control の双方に使える主状態を採用する
- Step Functions の中間的な task 失敗や待機は、主状態ではなく execution / event log で表現する
- 休暇取得成功と Calendar 登録成功がそろった時点を完了条件とする

## FR-09 対応ワークフロー

### フロー 1: Request 受付
1. `ReceiveChatMessage`
2. `ExtractVacationIntent`
3. `CheckMissingInformation`
4. 情報不足なら `COLLECTING_INFO` に遷移して再入力待ち
5. 情報充足なら `ANALYZING` に遷移

### フロー 2: 事前分析
1. `LoadGoogleCalendar`
2. `LoadTeamSchedule`
3. `CalculateVacationScore`
4. `GenerateNegotiationPlan`

補足:
- スコアは内部利用のみであり、UI 表示対象ではない

### フロー 3: Slack 送信準備
1. `GenerateSlackMessage`
2. `UpdateStatus(REVIEW_REQUIRED)`
3. `WaitForUserReview`
4. 承認後に `PostToSlack`
5. `UpdateStatus(NEGOTIATING)`

### フロー 4: 交渉継続とエスカレーション
1. 新しい交渉ログ到着時に `GenerateNegotiationPlan` を再評価する
2. `絶対休めるモード` で必要な場合に Negotiation Orchestrator Agent が弁護士 Agent 参加を要求する
3. Workflow State Coordinator が `ESCALATED` を記録し、Lawyer Agent Runtime を呼び出す
4. 最終方針が確定するまで交渉を継続する

### フロー 5: 成功処理
1. 休暇交渉成立時に `UpdateStatus(APPROVED)`
2. `RegisterCalendarLeave`
3. 登録成功で完了
4. 登録失敗時は `ErrorHandler` と `UpdateStatus(FAILED)` を実行

## 失敗モデル

### 失敗カテゴリ
- `TransientFailure`
- `BusinessFailure`
- `IntegrationFailure`
- `AgentRuntimeFailure`
- `FatalFailure`

### 失敗処理方針
- `TransientFailure` は Step Functions Retry / Backoff の対象とする
- `BusinessFailure` は追加確認または UI への説明へ送る
- `IntegrationFailure` は adapter 障害として扱い、復旧可能性を評価する
- `AgentRuntimeFailure` は Bedrock 実行失敗として扱い、代替テンプレートまたは人間レビューへフォールバックする
- `FatalFailure` は execution を終了し、次回 task と再開手順を表示する

## Amplify Hosting との論理接続
- Amplify Hosting の詳細なリソース定義は Frontend Unit へ委ねる
- ただし本 Unit は、Frontend が参照すべき API 契約を先に固定する
  - 公開 API Base URL
  - 読み取り用 request status endpoint
  - workflow 開始 endpoint
  - 必要な runtime environment variable 一覧

## Testable Properties

### PBT-01 対応
- **Workflow state transitions**
  - Category: `Invariant`
  - Property: 許可された主状態遷移のみが発生する
- **Retry scheduling**
  - Category: `Idempotence`
  - Property: 同一 retry exhaustion 判定を再適用しても failure state は変化しない
- **Request / event projection**
  - Category: `Round-trip`
  - Property: event log から再構成される state projection を serialize / deserialize しても意味が保持される

### PBT 適用境界
- Bedrock AgentCore Runtime 自体の推論品質はこの段階の property test 対象ではない
- 機械的に検証できる workflow / state / projection を中心に扱う
