# aws-aidlc-daimonji

AI-DLC (AI-Driven Lifecycle Cycle) ワークフローをClaude Codeで運用するチームプロジェクトです。

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

## ライセンス

同梱しているAI-DLCワークフロー定義は upstream の [MIT-0ライセンス](https://github.com/awslabs/aidlc-workflows/blob/main/LICENSE) に従います。
