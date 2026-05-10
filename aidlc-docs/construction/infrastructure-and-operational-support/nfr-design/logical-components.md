# Infrastructure and Operational Support 論理コンポーネント

## 概要
本書は `Infrastructure and Operational Support` Unit における論理コンポーネントを定義する。ここでは AWS 実サービス確定前の論理責務と接続関係を示す。

## 1. Public Request Entry

### 責務
- フロントからの公開リクエストを受け付ける。
- 入力を受理し、バックエンド実行開始へ橋渡しする。

### 補足
- `API Gateway` を使う場合は、この論理コンポーネントに相当する。
- 内部コンポーネント間通信には使わない。

## 2. Workflow Starter

### 責務
- 公開入口から受けたリクエストを元にワークフローを開始する。
- 初期 `Request` 作成と初回イベント記録をトリガーする。

### 接続
- `Public Request Entry` から呼ばれる。
- `Workflow State Coordinator` を起動する。

## 3. Workflow State Coordinator

### 責務
- ワークフロー全体の状態遷移、分岐、待機、再試行方針を管理する。
- 一時障害時の Retry / Backoff を主導する。
- `FATAL` への遷移条件を管理する。

### 補足
- 論理的には Step Functions 相当の中核である。

## 4. Request State Store

### 責務
- `Request` の現在状態を単一の参照元として保持する。
- UI や他 Unit から高速に参照できる状態面を提供する。

### 特徴
- 主な読み取り対象は現在状態。
- 更新は `Workflow State Coordinator` またはその配下の処理から行う。

## 5. Request Event Log

### 責務
- 状態変化、交渉イベント、エスカレーション理由、再試行履歴を記録する。
- 監査とトラブルシュートのための詳細履歴を提供する。

### 特徴
- 現在状態の代替ではなく補助情報として扱う。
- `Request State Store` と組み合わせて参照する。

## 6. Failure Classifier

### 責務
- 障害を `Transient`、`Business`、`Fatal` などへ分類する。
- 再試行対象か否かを判断するための材料を提供する。

### 接続
- `Workflow State Coordinator` から参照される。
- `Notification Aggregator` と `UI Failure Presenter` に分類結果を渡す。

## 7. Retry Policy Controller

### 責務
- Retry 対象処理の回数、間隔、打ち切り条件を管理する。
- 同一ワークフロー内での再試行方針を一貫させる。

### 接続
- `Workflow State Coordinator` に統合されるか、そこから利用される補助コンポーネントとして扱う。

## 8. UI Failure Presenter

### 責務
- `FATAL` または業務上の失敗を UI に返すための失敗表現を整える。
- トースト等の明示的表示向けのデータを生成する。

### 補足
- 通知成否とは独立して動作する。
- ユーザー向けの失敗可視化を最優先とする。

## 9. Notification Aggregator

### 責務
- 高重要度障害通知をワークフロー単位で集約する。
- 同一 Request 内の重複通知を抑制する。

### 出力
- Slack 向けの通知ペイロード
- 通知対象の最終失敗要約

## 10. Operational Notification Relay

### 責務
- 集約済み通知を外部通知先へ送る。
- 通知送信失敗を主ワークフロー失敗へ波及させない。

### 補足
- MVP では Slack Webhook が主対象となる。

## 11. Observability Log Writer

### 責務
- 構造化ログを書き込む。
- 相関キーを用いて後追い分析可能なログを残す。

### 必須キー
- `requestId`
- `workflowExecutionId`
- `state`
- `failureCategory`
- `retryAttempt`

## 12. Component Relationships

### 基本フロー
1. `Public Request Entry` がリクエストを受ける
2. `Workflow Starter` が初期化してワークフローを起動する
3. `Workflow State Coordinator` が分岐、待機、再試行を制御する
4. `Request State Store` と `Request Event Log` が進行情報を保持する
5. 障害時は `Failure Classifier` が分類し、必要に応じて `Retry Policy Controller` が再試行を決める
6. `FATAL` または重要障害時は `UI Failure Presenter` と `Notification Aggregator` がそれぞれ UI 向け、通知向け処理を行う
7. `Operational Notification Relay` が Slack へ通知する
8. `Observability Log Writer` が全体の構造化ログを残す

## 13. 将来差し替えしやすくする境界
- `Public Request Entry` は API Gateway 以外の入口へ差し替え可能とする
- `Operational Notification Relay` は Slack 以外の通知先へ差し替え可能とする
- `Request State Store` と `Request Event Log` は同一ストアでも別ストアでもよいよう論理分離しておく
- `Workflow State Coordinator` は Step Functions 前提で進めつつ、責務名としては AWS 固有名へ固定しすぎない
