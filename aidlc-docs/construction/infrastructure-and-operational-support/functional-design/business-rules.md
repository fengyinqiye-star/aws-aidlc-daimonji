# Infrastructure and Operational Support Business Rules

## 1. ワークフロー起動ルール
- 新規 request は必ず `ReceiveChatMessage` から開始する。
- API entry Lambda は state machine を起動するまでで責務を止め、交渉判断や外部連携を持ってはならない。
- request 起動時には初期 `Request` と初期 `RequestEvent` を必ず記録する。

## 2. 状態遷移ルール
- `DRAFT` から直接 `NEGOTIATING` へ遷移してはならない。
- 情報不足時は必ず `COLLECTING_INFO` を経由する。
- 分析開始後は `ANALYZING` を経由してから `REVIEW_REQUIRED` または `NEGOTIATING` に進む。
- 人手レビューが必須のため、Slack 投稿前には必ず `REVIEW_REQUIRED` を経由する。
- 交渉成立時のみ `APPROVED` に遷移できる。
- `FAILED` は workflow 継続不能または登録失敗を含む終端状態とする。

## 3. Step Functions タスク分割ルール
- State Machine は FR-09 の論理ステップに近い粒度で task を分割する。
- ひとつの task に複数の主要業務責務を詰め込まない。
- task 名から業務ステップが追跡できること。
- 障害時には失敗した task 名と requestId が必ず結び付けられること。

## 4. Agent Runtime ルール
- Negotiation Orchestrator Agent は交渉判断と会話制御を担う。
- Lawyer Agent は `絶対休めるモード` において必要時のみ参加する。
- Agent Runtime 呼び出しは Step Functions から明示タスクとして制御されること。
- Lawyer Agent の参加判断は request 状態、交渉ログ、現在方針に基づくこと。
- Lawyer Agent 参加後も同一 requestId と同一 Slack thread ref を維持すること。

## 5. モード別ルール
- `must-succeed` 相当の request は、必要に応じて Lawyer Agent 参加を要求できる。
- `best-effort` 相当の request は、自動的に Lawyer Agent 参加へ進めない。
- `best-effort` で交渉不成立となった場合、率直なフィードバックをそのまま返すため、強制継続フローへ遷移しない。

## 6. Review / Slack 投稿ルール
- 外部向け Slack 投稿前には必ず review 承認を待つ。
- 未承認状態で `PostToSlackTask` を実行してはならない。
- 投稿失敗時は `IntegrationFailure` として記録し、再試行可能かどうかを分類する。

## 7. Calendar 登録ルール
- `RegisterCalendarLeaveTask` は `APPROVED` request に対してのみ実行可能とする。
- 登録前にはユーザー確認が完了していなければならない。
- 登録失敗時は `FAILED` とイベントログで理由を表現する。

## 8. Retry / Failure ルール
- `TransientFailure` のみ自動再試行対象とする。
- `BusinessFailure` は再試行してはならない。
- `AgentRuntimeFailure` は Bedrock 側失敗として独立分類する。
- 再試行上限超過後は `FatalFailure` へ昇格する。
- `FatalFailure` 発生時は実行継続ではなく終端処理と通知へ進む。

## 9. Request Tracking ルール
- 現在状態は単一値で管理する。
- 詳細な進行は event log と task execution log に記録する。
- 読み取り API は現在状態と event log を組み合わせて返すが、内部 execution metadata を UI 契約へそのまま漏らさない。

## 10. Amplify / Frontend 契約ルール
- Frontend Unit が未実装でも、Amplify 側から必要となる API 境界と environment variable 名は本 Unit で定義する。
- Amplify 自体の詳細 IaC は Frontend Unit 側へ委ねるが、接続前提は後続 Unit が参照できるように保持する。

## 11. フェーズ乖離監視ルール
- 乖離監視 automation は毎日 1 回の cron 実行を基本とする。
- `Blocking` と `Material` の新規乖離は issue 化対象とする。
- 同種の open issue が存在する場合、重複作成ではなく更新を優先する。

## 12. Testable Properties

### Invariant
- 許可された状態遷移のみが成立する。
- review 未承認の request では `PostToSlackTask` に到達しない。

### Idempotence
- 同一 failure classification を複数回評価しても終端 failure category は変化しない。
- 同じ drift finding を既存 issue へ再反映しても issue 候補の集合は増殖しない。

### Round-trip
- Request 状態と event log の投影結果は serialize / deserialize 後も論理等価である。

### Oracle
- drift severity の分類規則は簡易 reference classifier と一致する。
