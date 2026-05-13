# Infrastructure and Operational Support 論理コンポーネント

## 概要
本書は、restart 後の `Infrastructure and Operational Support` Unit における論理コンポーネントを定義する。基準は restarted NFR Requirements と restarted Functional Design であり、Step Functions の task 分解、Bedrock AgentCore Runtime、task 単位 observability、request tracking、frontend 向け公開契約を明示的に扱う。

## 1. Public Request Contract Boundary

### 責務
- 将来の Frontend Unit が利用する公開契約を定義する
- API Base URL、主要 endpoint、必要 environment variable 名を固定する
- 外部公開契約と内部 orchestration 責務を分離する

### requirement との対応
- restarted NFR の Frontend 連携要件に対応する

## 2. Public Request Entry

### 責務
- 外部からの request を受理する
- 入力を検証し、workflow 開始経路へ渡す

### 境界ルール
- このコンポーネントは公開入口専用とする
- 内部コンポーネント間通信はここへ戻さない

## 3. Workflow Starter

### 責務
- 初期 request state を作成する
- 初回 event を記録する
- workflow 実行を開始する

### requirement との対応
- `POST /requests` を数秒以内で返す restarted パフォーマンス要件に対応する

## 4. Workflow State Coordinator

### 責務
- workflow 全体の状態遷移、分岐、待機、再試行、終端遷移を管理する
- failure classification 結果を受けて retry / explicit failure / fallback を決定する

### requirement との対応
- restarted 可用性 / 信頼性要件にある retry / backoff の中心責務になる
- task 単位 observability を維持するため、各 step を名前付き遷移として扱う

## 5. Task Execution Layer

### 責務
- restarted Functional Design に沿った task 単位の実行責務を担う
- 主要責務を 2 本の粗い Lambda に潰さず、workflow step ごとに責務を切る

### 想定される task 単位責務
- request intent extraction
- missing information check
- calendar / team data loading
- scoring / planning support
- Slack draft generation / review handling
- final registration or terminal failure transition

### requirement との対応
- task 単位 observability
- task 単位 failure localization
- maintainability のための責務分離

## 6. Failure Classifier

### 責務
- task 実行結果を以下の approved failure taxonomy に正規化する
  - `TransientFailure`
  - `BusinessFailure`
  - `IntegrationFailure`
  - `AgentRuntimeFailure`
  - `FatalFailure`

### requirement との対応
- restarted NFR が求める task 単位の障害分類・記録要件に対応する

## 7. Retry Policy Controller

### 責務
- retry 対象処理の回数、間隔、打ち切り条件を管理する
- `TransientFailure` のみを自動再試行対象として扱う

### requirement との対応
- restarted NFR の「自動再試行は `TransientFailure` のみ」という条件を実装上で支える

## 8. Bedrock Agent Runtime Gateway

### 責務
- `Bedrock AgentCore Runtime` への呼び出しを専用境界として隔離する
- Bedrock の遅延と障害を一般 task 実行と分離して観測可能にする
- orchestrator agent / lawyer agent の呼び出し経路を明確化する

### requirement との対応
- restart 理由のひとつである Bedrock 未反映を解消する設計上の中心境界
- restarted NFR の Bedrock 呼び出し分離観測要件に対応する

## 9. Human Review / Escalation Router

### 責務
- review-required または escalation-required な状態を人間レビュー経路へ送る
- Bedrock 障害や workflow 障害が silent degradation にならないようにする

### requirement との対応
- restarted NFR の「再試行または人間レビュー fallback を優先する」という方針に対応する

## 10. Request State Store

### 責務
- request の current state を主 read model として保持する

### requirement との対応
- `GET /requests/{requestId}` を数秒以内で返すための高速 read 経路になる
- restarted 整合性要件の current state 主軸方針に対応する

## 11. Request Event Log

### 責務
- 状態変化、retry 履歴、失敗理由、escalation 理由などの詳細履歴を保持する

### requirement との対応
- restarted NFR の auditability、説明責任、troubleshooting 要件に対応する

## 12. Task Execution Record Store

### 責務
- task 単位の execution metadata を保持する
- request、workflow、task、retry、failure の相関を残す

### requirement との対応
- 「どこで失敗したかを区別できること」という restarted observability 要件に対応する

## 13. UI Status Projection

### 責務
- workflow / state 遷移を UI が読める状態表現へ変換する
- `FATAL` や明示的失敗状態を UI に返す

### requirement との対応
- restarted NFR の「重大障害時は UI へ明示されること」に対応する

## 14. Notification Aggregator

### 責務
- 高重要度障害通知を workflow 単位で集約する
- 同一 workflow 内の重複通知を抑制する

### requirement との対応
- restarted NFR の「高重要度のみ通知」「通知スパム回避」に対応する

## 15. Operational Notification Relay

### 責務
- 集約済み通知を外部通知先へ送る
- 通知送信失敗を主 workflow 失敗へ波及させない

### requirement との対応
- restarted NFR の「Slack 通知は best-effort」という方針に対応する

## 16. Secret Access Boundary

### 責務
- Slack Webhook などの secret を解決する
- task 実装から secret の平文露出を切り離す

### requirement との対応
- restarted NFR の secret management 要件に対応する

## 17. Observability Log Writer

### 責務
- 構造化ログを出力する
- 機微本文を避けつつ、後追い調査に必要な相関情報を残す

### 必須相関キー
- `requestId`
- `workflowExecutionId`
- `taskName`
- `failureCategory`
- `retryAttempt`

### requirement との対応
- restarted NFR の task 単位 observability 要件に対応する

## 18. Metrics and Alarm Publisher

### 責務
- task 単位メトリクスと alarm 用シグナルを出力する
- routine telemetry と高重要度障害通知を分離する

### requirement との対応
- `CloudWatch Logs / Metrics / Alarm` を task 単位で持つという restarted NFR に対応する

## 19. コンポーネント関係

### 基本フロー
1. `Public Request Contract Boundary` が frontend 向け公開契約を定義する
2. `Public Request Entry` が request を受理する
3. `Workflow Starter` が初期 state と初回 event を作成して workflow を開始する
4. `Workflow State Coordinator` が task 指向 workflow を制御する
5. `Task Execution Layer` が step ごとの処理を実行する
6. `Bedrock Agent Runtime Gateway` は agent 実行が必要なときだけ呼ばれる
7. `Request State Store`、`Request Event Log`、`Task Execution Record Store` が state と診断情報を保持する
8. `UI Status Projection` が UI 向け状態を提供する
9. `Failure Classifier` と `Retry Policy Controller` が retry / terminal / fallback を決める
10. `Notification Aggregator` と `Operational Notification Relay` が高重要度通知を扱う
11. `Observability Log Writer` と `Metrics and Alarm Publisher` が可観測性出力を行う

## 20. 将来差し替えしやすい境界

### Frontend 進化への備え
- hosting や frontend 実装形が変わっても、公開契約境界は維持できるようにする

### Bedrock 進化への備え
- Bedrock gateway を専用境界にすることで、agent 実行の詳細変更が task 実装全体へ波及しにくいようにする

### 保存方式進化への備え
- current state、event log、task execution record は論理分離し、物理 store の集約 / 分離に耐えられるようにする

## 拡張ルール適用状況

### Security Baseline
- 状態: N/A
- 理由: `aidlc-state.md` で無効化されている

### Property-Based Testing
- 状態: Compliant
- 理由: restarted NFR が求める state projection、failure classification、serialization の PBT 適用境界を明示的に保持する設計へ更新した
