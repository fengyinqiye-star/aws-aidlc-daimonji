# アプリケーション設計サマリー

## 概要
本設計は、有休交渉 MVP を実現するための高レベルアプリケーション構造を定義する。対象はチャットファースト UI、モード別交渉、Slack スレッド連携、弁護士サブエージェント参加、交渉成立後の Google Calendar 登録、およびそれらを支えるオーケストレーションと永続化である。

## 設計方針
- フロントエンドは機能単位中心で分割する
- バックエンドはワークフロー中心のサービス境界を主軸にする
- 弁護士サブエージェントはオーケストレータが必要時に明示起動し、同一交渉スレッドへ参加させる
- Step Functions は状態遷移と外部呼び出し順序を担い、ドメイン判断はアプリケーションサービスが担う
- Google Calendar 登録前の確認は、ネゴシエーション結果フィードバックを返すチャットフローの中で AI が確認する

## 主要コンポーネント
- Chat Interaction Component
- Negotiation Workspace Component
- Slack Review Component
- Chat Workflow Service
- Negotiation Analysis Service
- Escalation Coordination Service
- Slack Negotiation Service
- Calendar Registration Service
- Request Tracking Service
- Adapter Layer
- Workflow Orchestration Layer

## 主要設計判断

### フロントエンド分割
画面単位ではなく、チャット入力、サマリー表示、Slack レビューなどの機能境界を主軸に分ける。これにより、チャット内確認や外部連携状態表示など、画面横断の振る舞いを実装しやすくする。

### バックエンド分割
ワークフロー中心に Chat / Negotiation / Escalation / Calendar Registration / Request Tracking を分離する。これにより、モード差分や交渉結果差分をサービス境界で整理しやすくする。

### エスカレーション設計
弁護士サブエージェントは常時待機ではなく、交渉のやり取り内容に応じてオーケストレータが明示的に起動する。参加先は同一の Slack 交渉スレッドとし、文脈維持を優先する。

### Calendar 登録確認
Slack 投稿レビューとは別に、交渉結果フィードバックを返すチャットの中で AI が Calendar 登録可否を確認する。これにより、交渉成立後のユーザー意思確認を自然な会話として扱える。

## サービス連携概要
- Chat Workflow Service がチャット起点の会話進行を制御する
- Negotiation Analysis Service が予定分析と交渉方針生成を行う
- Slack Negotiation Service が投稿文生成とスレッド投稿を行う
- Escalation Coordination Service が弁護士サブエージェント参加を制御する
- Calendar Registration Service が登録確認と Google Calendar 登録を行う
- Request Tracking Service が状態と成果物を永続化する
- Workflow Orchestration Layer が Step Functions からの制御を一本化する

## 依存方向
- UI -> アプリケーションサービス
- アプリケーションサービス -> Adapter / Request Tracking Service
- Workflow Orchestration Layer -> 各アプリケーションサービス
- Adapter -> 外部 API 実装

## 設計上の留意点
- `絶対休めるモード` と `できれば休みたいモード` の差分をサービス責務で埋もれさせない
- 外部障害時でもデモ継続できるよう、Adapter 層でフォールバック差し替え可能にする
- エスカレーション挙動とチャット内 Calendar 確認は後続の Functional Design で詳細化する

## 拡張ルール適用サマリー

### Security Baseline
- **状態**: N/A
- **理由**: Requirements Analysis で無効化されているため、このステージでの強制適用はない。

### Property-Based Testing
- **状態**: N/A
- **理由**: PBT ルールは Application Design では強制適用対象外である。
