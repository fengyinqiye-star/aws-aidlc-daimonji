# Unit of Work 計画

## 目的
有休交渉 MVP を、後続の設計・実装・テストへ進めやすい論理的な作業単位へ分解する。

## 分解対象の前提
- グリーンフィールドの新規システムである
- フロントエンド、オーケストレーション、外部連携、永続化、可観測性を含む
- `絶対休めるモード` と `できれば休みたいモード` の差分が重要である
- 弁護士サブエージェント参加と Google Calendar 登録を含む
- AWS ネイティブ構成と Step Functions による制御を前提とする

## 計画チェックリスト
- [x] 要件、ユーザーストーリー、アプリケーション設計、実行計画を確認する
- [x] この文書内の分解質問を解消する
- [x] ストーリーのグルーピング方針を確定する
- [x] 単位間依存関係の扱いを確定する
- [x] チーム/責務境界の考え方を確定する
- [x] コード配置戦略を確定する
- [x] `aidlc-docs/inception/application-design/unit-of-work.md` を生成する
- [x] `aidlc-docs/inception/application-design/unit-of-work-dependency.md` を生成する
- [x] `aidlc-docs/inception/application-design/unit-of-work-story-map.md` を生成する
- [x] 単位境界と依存関係の妥当性を確認する
- [x] すべてのストーリーがいずれかの単位に割り当たっていることを確認する
- [x] 承認依頼へ進める

## 予定成果物
- `unit-of-work.md`: 単位定義、責務、コード構成方針
- `unit-of-work-dependency.md`: 単位間依存関係
- `unit-of-work-story-map.md`: ストーリーと単位の対応表

## 分解質問

各質問の `[Answer]:` に回答してください。最後の選択肢を選ぶ場合は、選択肢の文字に加えて内容も記入してください。

## Question 1
作業単位の主な分け方はどれを基本にしますか。

A) レイヤー単位: Frontend / Backend / Integrations / Infrastructure
B) ワークフロー単位: Chat Intake / Negotiation / Escalation / Calendar Registration / Tracking
C) デプロイ単位: 将来のデプロイ境界を意識したサービス寄り分割
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 2
フロントエンドは独立した 1 単位として扱いますか、それともバックエンドの各機能単位に対応づけますか。

A) フロントエンドは独立した 1 単位として扱う
B) 各バックエンド機能単位に対応する形で分散させる
C) フロントエンドは 2 単位以上に分ける
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 3
弁護士エージェント参加の処理はどこに寄せますか。

A) Negotiation 単位に含める
B) Escalation 専用の独立単位にする
C) オーケストレーション単位に含める
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 4
Google Calendar 登録はどの単位で扱うのがよいですか。

A) Calendar Registration 専用単位に分ける
B) Negotiation 単位に含める
C) Integration 単位にまとめる
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 5
コード構成はどれを基本にしますか。

A) 単一リポジトリ内で `frontend` / `backend` / `shared` などのトップレベル分割にする
B) 単一リポジトリ内で `apps` / `packages` 型の構成にする
C) まずは最小構成で始め、後続で細分化する
D) その他（[Answer]: の後に記述してください）

[Answer]:A

## Question 6
単位分解で最も重視する観点はどれですか。

A) 実装のしやすさ
B) 将来の拡張性
C) デモ成立までのスピード
D) バランス重視
E) その他（[Answer]: の後に記述してください）

[Answer]:A

## 分解方針メモ
- モード差分が単位境界に埋もれないようにする
- 外部連携は Adapter 境界で差し替え可能にする
- 後続の Functional Design と Code Generation が進めやすい粒度にする
- グリーンフィールドのため、コード配置戦略も明示する

## 拡張ルール適用サマリー

### Security Baseline
- **Status**: N/A
- **Rationale**: `aidlc-docs/aidlc-state.md` で無効化されているため。

### Property-Based Testing
- **Status**: N/A
- **Rationale**: PBT の強制適用は Units Generation ステージでは開始されないため。

## 承認前提
この文書の質問回答が揃ったあと、作業単位成果物を生成する。
