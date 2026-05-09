# アプリケーション設計計画

## 目的
有休交渉 MVP の高レベルなアプリケーション構造を定義し、主要コンポーネント、サービス責務、メソッド境界、依存関係を明確にする。

## 設計対象の前提
- チャットファーストの有休交渉 Web アプリである
- `絶対休めるモード` と `できれば休みたいモード` を持つ
- 必要に応じて弁護士サブエージェントが Slack 交渉スレッドへ参加する
- 交渉成立後は Google Calendar 登録まで扱う
- AWS ネイティブ構成、Step Functions、Bedrock AgentCore Runtime、DynamoDB、Slack / Calendar Adapter を前提とする

## 設計計画チェックリスト
- [x] 要件定義、ユーザーストーリー、ペルソナ、実行計画を確認する
- [x] この文書内の設計質問を解消する
- [x] コンポーネント境界を確定する
- [x] サービス責務とオーケストレーション境界を確定する
- [x] メソッド粒度とインターフェース方針を確定する
- [x] 外部 Adapter とコアロジックの依存方向を確定する
- [x] `aidlc-docs/inception/application-design/components.md` を生成する
- [x] `aidlc-docs/inception/application-design/component-methods.md` を生成する
- [x] `aidlc-docs/inception/application-design/services.md` を生成する
- [x] `aidlc-docs/inception/application-design/component-dependency.md` を生成する
- [x] `aidlc-docs/inception/application-design/application-design.md` を生成する
- [x] 設計成果物の整合性を確認する
- [x] 設計承認依頼へ進める

## 予定成果物
- `components.md`: 高レベルコンポーネント定義と責務
- `component-methods.md`: コンポーネントごとの主要メソッドと入出力
- `services.md`: サービス定義、責務、オーケストレーション方式
- `component-dependency.md`: 依存関係、通信パターン、データフロー
- `application-design.md`: 上記を統合した設計サマリー

## 設計質問

各質問の `[Answer]:` に回答してください。最後の選択肢を選ぶ場合は、選択肢の文字に加えて内容も記入してください。

## Question 1
フロントエンドの機能境界はどの粒度で分ける想定にしますか。

A) 画面単位中心: Chat / Negotiation Summary / Slack Review / Request Detail を主軸に分ける
B) 機能単位中心: チャット入力、状態表示、交渉レビュー、外部連携状態表示などで分ける
C) 画面単位と機能単位のハイブリッドで分ける
D) その他（[Answer]: の後に記述してください）

[Answer]:B

## Question 2
バックエンドのコアサービス境界はどの形を主軸にしますか。

A) ワークフロー中心: Chat / Negotiation / Escalation / Calendar Registration / Request Tracking
B) 外部連携中心: Orchestrator / Slack / Calendar / Persistence / Observability
C) ドメイン中心: Vacation Request / Negotiation Thread / Agent Coordination / Leave Registration
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 3
弁護士サブエージェントの参加はどの設計方針を基本にしますか。

A) オーケストレータが必要時に明示的に起動し、同一交渉スレッドへ参加させる
B) 常時参加可能なエージェントとして待機させ、条件一致時のみ発話させる
C) まずは論理上の参加境界だけ定義し、実際の参加方式は後続設計に委ねる
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 4
Step Functions とアプリケーションサービスの責務分担はどれを基本にしますか。

A) Step Functions は状態遷移と外部呼び出し順序を担い、アプリケーションサービスはドメイン判断を担う
B) Step Functions に分岐ロジックも多く持たせ、アプリケーションサービスは薄くする
C) アプリケーションサービス側に判断を寄せ、Step Functions は最小限の制御にする
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 5
Google Calendar 登録前のユーザー確認はどこで担保する想定にしますか。

A) フロントエンド上の専用確認 UI で担保する
B) Slack 投稿レビューと同じ確認フロー内に含める
C) バックエンドで確認待ち状態を持ち、UI はその状態を表示して承認する
D) その他（[Answer]: の後に記述してください）

[Answer]:D: ネゴシエーション結果のFBがチャット形式で返答され、その際にカレンダー登録するかどうかをAI側から質問する。

## 設計方針メモ
- コンポーネントは責務が重複しすぎないようにする
- 外部 API 依存は Adapter の背後に隔離する
- ビジネスルールの詳細は Functional Design に回し、ここでは境界と責務に集中する
- モード差分、エスカレーション、交渉成立後の Calendar 登録が設計上埋もれないようにする

## 拡張ルール適用サマリー

### Security Baseline
- **Status**: N/A
- **Rationale**: `aidlc-docs/aidlc-state.md` で無効化されているため。

### Property-Based Testing
- **Status**: N/A
- **Rationale**: PBT の強制適用は Application Design ステージでは開始されないため。

## 承認前提
この文書の質問回答が揃ったあと、設計成果物を生成します。
