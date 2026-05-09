# サービス定義

## サービス一覧

### 1. Chat Workflow Service
- **責務**: チャット開始、メッセージ受理、不足情報確認、会話進行
- **入力**: ユーザー入力、セッション情報、リクエスト状態
- **出力**: 次の応答メッセージ、状態更新要求、ワークフロー起動要求
- **連携先**: Request Tracking Service、Workflow Orchestration Layer

### 2. Negotiation Analysis Service
- **責務**: 予定分析、内部スコア算出、影響度判定、モード別交渉方針生成
- **入力**: 休暇意図、カレンダー情報、チーム予定、モード
- **出力**: 交渉分析結果、交渉方針、フィードバック要約
- **連携先**: TeamScheduleAdapter、GoogleCalendarAdapter、Request Tracking Service

### 3. Escalation Coordination Service
- **責務**: 交渉ログに基づく弁護士サブエージェント起動判断、参加制御、戦略更新
- **入力**: 交渉履歴、現在方針、Slack スレッド文脈
- **出力**: エスカレーション判断、エージェント参加結果、更新方針
- **連携先**: AgentRuntimeAdapter、Slack Negotiation Service、Request Tracking Service

### 4. Slack Negotiation Service
- **責務**: Slack ドラフト生成、レビュー待ち状態移行、スレッド投稿、投稿結果記録
- **入力**: 交渉方針、関係者情報、レビュー結果
- **出力**: Slack ドラフト、投稿結果、失敗情報
- **連携先**: SlackAdapter、Request Tracking Service

### 5. Calendar Registration Service
- **責務**: 交渉成立後の登録内容生成、チャット確認、Google Calendar 登録、結果保存
- **入力**: 交渉結果、休暇日程、ユーザー確認結果
- **出力**: 登録候補内容、確認メッセージ、登録結果
- **連携先**: GoogleCalendarAdapter、Chat Workflow Service、Request Tracking Service

### 6. Request Tracking Service
- **責務**: 永続化、状態遷移、履歴管理、詳細表示用データ集約
- **入力**: 状態更新、生成成果物、投稿結果、登録結果
- **出力**: 現在状態、履歴、詳細画面用ビュー
- **連携先**: DynamoDB 相当の永続化層、全アプリケーションサービス

### 7. Workflow Orchestration Layer
- **責務**: Step Functions からのステップ実行順序制御、レビュー待ち、交渉結果に応じた遷移
- **入力**: ワークフローステップ名、リクエスト ID、レビューアクション
- **出力**: 次ステップの実行結果、待機状態、エラー分岐
- **連携先**: 全アプリケーションサービス

## オーケストレーション方針

### Step Functions の責務
- 状態遷移の管理
- 外部呼び出し順序の制御
- 人手レビュー待ちと再開
- Calendar 登録処理への遷移判断

### アプリケーションサービスの責務
- ドメイン判断
- モード差分処理
- 交渉戦略生成
- 弁護士エージェント参加要否判断
- フィードバック整形

## 主要オーケストレーションパターン

### 1. チャット起点フロー
1. Chat Workflow Service が入力を受理する
2. Workflow Orchestration Layer が意図抽出と不足情報確認を進める
3. Request Tracking Service が状態を保存する

### 2. 交渉分析フロー
1. Negotiation Analysis Service が予定情報を読み込む
2. 交渉方針と内部分析結果を生成する
3. Slack Negotiation Service がレビュー用ドラフトを生成する

### 3. エスカレーションフロー
1. 交渉ログを Escalation Coordination Service が評価する
2. 必要時に AgentRuntimeAdapter 経由で弁護士サブエージェントを起動する
3. 同じスレッド文脈を使って戦略を更新する

### 4. 交渉成立後フロー
1. Slack 交渉結果が成立として確定する
2. Calendar Registration Service が登録候補内容を生成する
3. Chat Workflow Service がチャット内で登録確認を行う
4. 承認後に GoogleCalendarAdapter が登録を実行する

## サービス分離の理由
- モード差分と外部連携差分を同時に扱うため、責務分離がないと変更耐性が落ちる
- 弁護士エージェント参加は通常交渉と異なる制御境界を持つため独立サービスが必要
- Calendar 登録確認をチャット内で行うため、Slack レビューとは独立した登録サービスが必要
