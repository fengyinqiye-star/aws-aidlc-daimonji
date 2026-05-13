# Infrastructure and Operational Support NFR 設計パターン

## 概要
本書は、restart 後の `Infrastructure and Operational Support` Unit に対する NFR 設計パターンを定義する。設計の基準は、再実行前の Construction artifact ではなく、`aidlc-docs/construction/infrastructure-and-operational-support/nfr-requirements/nfr-requirements.md` に記載された restarted NFR Requirements である。

## 1. requirement から design への対応

### スケーラビリティ要件 -> 独立した伸縮境界
- restarted NFR では、単一リージョン MVP を前提にしつつ、オーケストレーション、task 実行、状態保存、Bedrock 呼び出しが個別に伸縮できる構造を求めている。
- このため設計上は、以下の境界を論理的に分離する。
  - 公開 API 入口境界
  - workflow 制御境界
  - task 実行境界
  - request 現在状態保持境界
  - event log 保持境界
  - Bedrock AgentCore Runtime 呼び出し境界

### パフォーマンス要件 -> 高速受理 + 非同期進行
- restarted NFR では、`POST /requests` と `GET /requests/{requestId}` を数秒以内で応答可能にし、長い推論処理を同期 API 応答に含めないことを求めている。
- このため設計上は、以下を採用する。
  - 受理後すぐに workflow を開始する高速受理パス
  - 受理後の主要処理を非同期で進める workflow 進行
  - 現在状態を即時参照する read パス
  - 詳細確認時のみ event log を使う補助 read パス

### 可用性 / 信頼性要件 -> 明示的障害分類 + 制限付き再試行
- restarted NFR では、`TransientFailure` のみを自動再試行対象とし、`AgentRuntimeFailure` を独立分類し、retry exhaustion 後は明示的失敗に昇格させることを求めている。
- このため設計上は、以下を採用する。
  - workflow 主導の再試行制御
  - 障害分類後に retry / 終端 / 人間レビュー fallback を決定するルーティング
  - retry exhaustion 後の明示的な terminal state 遷移

### セキュリティ要件 -> 最小露出 + secret 分離
- restarted NFR では、交渉文面、法務助言、Slack thread 情報などの機微情報を最小露出で扱うことを求めている。
- このため設計上は、以下を採用する。
  - 構造化ログへの最小限メタデータ出力
  - 通知資格情報を扱う専用 secret 境界
  - 通知本文での機微情報抑制
  - 本文そのものではなく参照や要約中心の運用

### 可観測性要件 -> task 単位の失敗局所化
- restarted NFR では、workflow 全体よりも task 単位での失敗局所化を優先している。
- このため設計上は、以下を採用する。
  - task 単位の構造化ログ
  - task 単位のメトリクス
  - 高重要度障害だけを通知対象にする alarm / notification 方針
  - request / workflow / task / retry の相関キー

### Frontend 連携要件 -> 公開契約の固定
- restarted NFR では、Frontend Unit 向けに API Base URL、主要 endpoint、必要 environment variable 名をこの unit 側で固定することを求めている。
- このため設計上は、公開 API 契約を非機能境界として先に固定し、Amplify Hosting の詳細 IaC は後続 Unit に委ねる。

### PBT 要件 -> 決定的な projection / classification 境界
- restarted NFR では、workflow state projection、retry / failure classification、request / event serialization、frontend runtime contract serialization に PBT を適用できるようにすることを求めている。
- このため設計上は、隠れた状態遷移を避け、分類と projection の境界を決定的に保つ。

## 2. レジリエンス設計パターン

### workflow 主導の retry / backoff
- 再試行は task ごとの ad hoc 実装ではなく、workflow 制御側が一元管理する。
- task handler は結果と障害分類を返し、再試行有無の最終判断は workflow 側が担う。

### 障害分類後に回復方針を決定する
- task の失敗はまず以下の分類へ正規化する。
  - `TransientFailure`
  - `BusinessFailure`
  - `IntegrationFailure`
  - `AgentRuntimeFailure`
  - `FatalFailure`
- その後に retry、明示的失敗、人間レビュー fallback のいずれへ進むかを決定する。

### Bedrock 障害は人間レビュー fallback を持つ
- Bedrock 関連障害は単なる generic failure に埋もれさせず、`AgentRuntimeFailure` として扱う。
- そのうえで、bounded retry または人間レビュー fallback に接続する。

## 3. パフォーマンス設計パターン

### 高速受理パターン
- 公開 API 入口では、request 受理、初期 state 作成、workflow 開始に必要な最小処理だけを行う。
- 長時間の Bedrock 推論や下流処理は同期応答の完了条件に含めない。

### read 最適化された current state
- UI や後続 Unit の主要 read は current state を主参照にする。
- event log は詳細追跡用であり、毎回の read の主経路には置かない。

### Bedrock 遅延分離パターン
- Bedrock 呼び出しは専用境界に分離し、一般 task の遅延と混ざらないようにする。

## 4. 整合性 / 監査性設計パターン

### current state + event history 併用
- current state は UI と下流参照のための主 read model とする。
- event history は監査、説明責任、トラブルシュートのための主 audit model とする。
- 状態更新と event 追加は同一の business transition 責務として扱う。

### 相関キー付き execution 記録
- task 実行結果は以下の相関キーで追跡できるようにする。
  - `requestId`
  - `workflowExecutionId`
  - `taskName`
  - `failureCategory`
  - `retryAttempt`

## 5. 通知設計パターン

### UI 優先の terminal failure 可視化
- ユーザー向けの terminal failure 表示は、外部通知送信成功に依存させない。
- UI での失敗可視化と Slack 通知は別責務として扱う。

### workflow 単位の高重要度通知集約
- 外部通知は高重要度障害のみ対象とする。
- 同一 workflow 内の重複通知は集約し、通知スパムを避ける。
- 通知内容は raw payload ではなく要約中心とする。

## 6. セキュリティ / データ露出パターン

### 構造化ログ + payload 抑制
- ログは state、分類、相関キーを中心に構造化する。
- 交渉本文や法務文面などの機微本文はログに全文出力しない。

### secret access 分離
- 通知資格情報などの secret 取得は専用境界で扱う。
- task 実装側が平文 secret を自由に扱わない構造にする。

## 7. 公開契約設計パターン

### 公開入口専用 gateway
- gateway は frontend など外部クライアント向け入口としてのみ使う。
- 内部 workflow / task 間通信を公開 API 境界に戻さない。

### 契約先行の frontend 連携
- Frontend Unit が実装される前に、接続前提の API 契約をこの unit で固定する。
- Amplify Hosting の実体設計は後続 Unit に残すが、接続面はここで固定する。

## 8. 後続 Construction への影響

### Infrastructure Design への影響
- infrastructure mapping は、ここで定義した境界を潰さないことが前提になる。
- Bedrock 隔離境界と task 単位 observability は infrastructure mapping に残す必要がある。

### Code Generation への影響
- code generation では、決定的な state projection と failure classification を保つ必要がある。
- PBT は `fast-check + Vitest` 前提で、この設計境界を対象に組み立てる。

## 拡張ルール適用状況

### Security Baseline
- 状態: N/A
- 理由: `aidlc-state.md` で無効化されている

### Property-Based Testing
- 状態: Compliant
- 理由: restarted NFR で定義された PBT 適用対象に対して、決定的な分類 / projection / serialization 境界を保つ設計に更新した
