# Unit of Work 定義

## 分解方針
- 主な分け方はレイヤー単位
- フロントエンドは独立した 1 単位として扱う
- 弁護士エージェント参加は Negotiation 単位に含める
- Google Calendar 登録は専用単位に分ける
- コード構成は単一リポジトリ内で `frontend` / `backend` / `shared` のトップレベル分割を基本とする
- 単位分解では実装しやすさを最重視する

## コード構成戦略

### 推奨トップレベル構成
```text
<workspace-root>/
├── frontend/
├── backend/
│   ├── chat-intake/
│   ├── negotiation/
│   ├── calendar-registration/
│   ├── tracking/
│   └── infrastructure-support/
├── shared/
│   ├── types/
│   ├── adapters/
│   └── utils/
└── infra/
```

### 構成意図
- `frontend/` は UI と画面横断状態をまとめる
- `backend/` はワークフロー中心の主要責務をサブディレクトリで分ける
- `shared/` は型、Adapter 契約、共通ユーティリティを置く
- `infra/` は IaC やデプロイ関連を置く

## Unit 1: Frontend Experience

### 目的
チャット入力、交渉要約、Slack レビュー、Request Detail、Calendar 登録確認表示を含むユーザー体験を担う。

### 責務
- チャット UI と会話進行
- 交渉結果フィードバック表示
- Slack 投稿レビュー UI
- Request Detail 表示
- Calendar 登録確認の UI 応答

### 主な対象
- `frontend/`
- UI 状態管理
- API 呼び出しクライアント

## Unit 2: Backend Chat Intake and Tracking

### 目的
チャット開始、不足情報収集、状態遷移、履歴保存、Request Detail 用データ集約を担う。

### 責務
- チャット入力受付
- 意図抽出の起点
- 不足情報確認
- ステータス管理
- 履歴永続化

### 主な対象
- `backend/chat-intake/`
- `backend/tracking/`
- `shared/types/`

## Unit 3: Backend Negotiation and Escalation

### 目的
予定分析、交渉方針生成、Slack ドラフト生成、弁護士エージェント参加を含む交渉コアを担う。

### 責務
- Google Calendar / チーム予定の分析
- モード別交渉方針生成
- Slack 投稿文ドラフト生成
- 交渉ログに基づく弁護士エージェント参加判断
- 弁護士エージェント参加後の戦略更新

### 主な対象
- `backend/negotiation/`
- `shared/adapters/`
- `shared/utils/`

## Unit 4: Calendar Registration

### 目的
交渉成立後の Calendar 登録確認と登録実行を担う。

### 責務
- 登録候補内容作成
- チャット内確認フロー連携
- Google Calendar 休暇予定登録
- 登録結果記録

### 主な対象
- `backend/calendar-registration/`
- `shared/adapters/`

## Unit 5: Infrastructure and Operational Support

### 目的
Step Functions、API Gateway、Secrets、ログ、デモフォールバックなど、システム実行基盤を担う。

### 責務
- AWS リソース定義
- ワークフロー制御構成
- 外部認証情報管理
- ログ / 可観測性設定
- デモ用フォールバック切り替え支援

### 主な対象
- `infra/`
- `backend/infrastructure-support/`

## 単位境界の妥当性
- モード差分のコア判断は Negotiation 単位に集約する
- UI は Frontend 単位で閉じる
- Calendar 登録は交渉成立後フローとして独立させる
- 状態追跡は Chat Intake / Tracking 単位で横断管理する
- 実装しやすさ優先のため、過度な細分化は避ける
