# Infrastructure and Operational Support Business Rules

## 1. ワークフロー開始ルール
- 新規 request は必ず `ReceiveChatMessage` から開始する
- API entry Lambda は state machine 開始までのみを担い、交渉判断や長時間処理は担わない
- request 受付時には初期 `Request` と初期 `RequestEvent` を必ず記録する

## 2. 状態遷移ルール
- `DRAFT` から直接 `NEGOTIATING` へ遷移してはならない
- 情報不足時のみ `COLLECTING_INFO` を使用する
- 分析完了後は `ANALYZING` から `REVIEW_REQUIRED` または `NEGOTIATING` に遷移する
- 人間レビューが必要な request では、Slack 送信前に必ず `REVIEW_REQUIRED` を経由する
- 休暇交渉成立時のみ `APPROVED` に遷移できる
- `FAILED` は workflow 失敗または Calendar 登録失敗を含む終端状態とする

## 3. Step Functions タスク分解ルール
- State Machine は FR-09 の論理ステップに沿った粒度で task を分解する
- ひとつの task に複数の主要責務を詰め込まない
- task 名だけで失敗箇所が識別できること
- すべての task 実行結果は requestId と taskName が追跡できる形で記録する

## 4. Agent Runtime ルール
- Negotiation Orchestrator Agent は交渉方針と理由整理を担う
- Lawyer Agent は `絶対休めるモード` で必要になった場合のみ参加する
- Agent Runtime 呼び出しは Step Functions から task 境界として行う
- Lawyer Agent の参加判定は request 状態、交渉ログ、現在方針に基づく
- Lawyer Agent 参加後も同一 requestId と同一 Slack thread ref を維持する

## 5. モード別ルール
- `must-succeed` の request は、必要に応じて Lawyer Agent 参加を許可できる
- `best-effort` の request は、原則として Lawyer Agent 参加へ進めない
- `best-effort` で休暇取得不成立となった場合は、率直なフィードバックをそのまま返し、追加交渉フローへ遷移しない

## 6. Review / Slack ルール
- 初回投稿前の Slack メッセージは必ず review 承認を受ける
- 未承認状態で `PostToSlackTask` を実行してはならない
- Slack 投稿失敗時は `IntegrationFailure` として扱い、再試行方針を決定する

## 7. Calendar 登録ルール
- `RegisterCalendarLeaveTask` は `APPROVED` request に対してのみ実行可能とする
- 登録前にはユーザー確認が完了していなければならない
- 登録失敗時は `FAILED` と event log で結果を記録する

## 8. Retry / Failure ルール
- `TransientFailure` のみ自動再試行対象とする
- `BusinessFailure` は自動再試行してはならない
- `AgentRuntimeFailure` は Bedrock 障害として段階的にフォールバックする
- 自動再試行回数超過後は `FatalFailure` に昇格する
- `FatalFailure` 発生時は workflow 実行を終了し、復旧情報を返す

## 9. Request Tracking ルール
- 現在状態は単一の正とする
- 詳細な進行情報は event log と task execution log に記録する
- 読み取り API は現在状態と event log を組み合わせて返すが、内部 execution metadata を UI 表示用へそのまま露出しない

## 10. Amplify / Frontend 契約ルール
- Frontend Unit が未実装でも、Amplify 側から必要となる API 境界と environment variable 名は本 Unit で定義する
- Amplify 自体の詳細 IaC は Frontend Unit 側へ委ねるが、接続前提は後続 Unit が参照できるように保持する

## 11. Testable Properties

### Invariant
- 許可された状態遷移のみが発生する
- review 未承認の request では `PostToSlackTask` に遷移しない

### Idempotence
- 同一 failure classification を再評価しても最終 failure category は変化しない

### Round-trip
- Request 状態と event log の投影結果は serialize / deserialize 後も意味を保持する
