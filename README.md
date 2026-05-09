# aws-aidlc-daimonji

AI-DLC (AI-Driven Lifecycle Cycle) ワークフローをClaude Codeで運用するチームプロジェクトです。

## 現在の進捗

- **現在地**: AI-DLC の **INCEPTION PHASE 完了**
- **次ステージ**: `CONSTRUCTION PHASE`
- **現時点の主成果物**:
  - 要件定義: `aidlc-docs/inception/requirements/`
  - ユーザーストーリー / ペルソナ: `aidlc-docs/inception/user-stories/`
  - 実行計画: `aidlc-docs/inception/plans/execution-plan.md`
  - アプリケーション設計 / Unit of Work: `aidlc-docs/inception/application-design/`

ハッカソン応募時点では、主にこの Inception フェーズの成果物が書類審査向けの提出対象です。実装中心の `CONSTRUCTION PHASE` は、その後の MVP デモおよびデプロイに向けたフェーズとして位置づけています。

## このリポジトリで採用しているワークフロー

[AWS AI-DLC Workflows](https://github.com/awslabs/aidlc-workflows) (v0.1.8 / MIT-0) を採用しています。
ルール本体は以下に同梱されています：

- [`CLAUDE.md`](./CLAUDE.md) — Claude Codeが自動ロードするコアワークフロー
- [`.aidlc-rule-details/`](./.aidlc-rule-details/) — 各フェーズの詳細ルール
  - `common/` — 共通ルール（用語、検証、質問形式 など）
  - `inception/` — 要件分析・設計フェーズ
  - `construction/` — 機能/インフラ設計、コード生成、ビルド&テスト
  - `extensions/` — opt-in拡張（セキュリティ等）
  - `operations/` — 運用フェーズ

## チームメイト向けセットアップ

1. このリポジトリをclone
2. プロジェクトルートで Claude Code を起動 (`claude` または VS Code拡張)
3. `CLAUDE.md` が自動ロードされ、AI-DLCワークフローが有効になります

別途のセットアップは不要です（ルール一式がリポジトリに同梱されています）。

## AI-DLC フェーズの位置づけ

### INCEPTION PHASE
- 要件定義・設計を担うフェーズ
- ハッカソンの書類審査で提出する成果物の中心
- 本リポジトリでは Requirements / User Stories / Workflow Planning / Application Design / Units Generation まで完了

### CONSTRUCTION PHASE
- 実装フェーズ
- 書類審査通過後の MVP デモや AWS 上の実装・検証で本格的に進める対象

### OPERATIONS PHASE
- 今回のハッカソン応募時点では対象外の将来フェーズ

## ライセンス

同梱しているAI-DLCワークフロー定義は upstream の [MIT-0ライセンス](https://github.com/awslabs/aidlc-workflows/blob/main/LICENSE) に従います。
