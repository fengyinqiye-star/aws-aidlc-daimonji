# Infrastructure and Operational Support インフラ設計

## 概要
本書は `Infrastructure and Operational Support` Unit の論理コンポーネントを、実際の AWS サービスへ対応付けたインフラ設計を定義する。対象は、公開入口、ワークフロー制御、状態保存、イベント記録、秘密情報管理、監視、および通知基盤である。

## 1. クラウド・デプロイ前提

### クラウド方針
- クラウドプロバイダは AWS を前提とする。
- MVP は単一環境で構成する。

### 理由
- 現時点では MVP 優先であり、環境分離よりも構成確定と実装速度を優先する。
- `dev` のみをまず成立させ、後続で `stg` や `prod` を追加できるようにする。

## 2. 公開入口のサービスマッピング

### Public Request Entry
- 論理コンポーネント `Public Request Entry` は `Amazon API Gateway` にマッピングする。

### 役割
- フロントからの HTTP リクエスト受付
- バックエンド Lambda へのルーティング
- 将来的な認証、レート制御、CORS 対応の拡張余地の確保

### 設計方針
- API Gateway は公開入口専用とする。
- 内部コンポーネント間通信には利用しない。

## 3. 実行・オーケストレーションのサービスマッピング

### Workflow Starter
- `AWS Lambda`

### Workflow State Coordinator
- `AWS Step Functions`

### 設計方針
- フロントからの初回要求は `API Gateway -> Lambda -> Step Functions` で開始する。
- 再試行、待機、分岐、`FATAL` への遷移は Step Functions 主導で管理する。
- Lambda 側での独自再試行ループは原則持たせない。

## 4. 状態保存・イベント記録のサービスマッピング

### Request State Store
- `Amazon DynamoDB`

### Request Event Log
- `Amazon DynamoDB`

### 保存方針
- 現在状態とイベントログは、どちらも DynamoDB で管理する。
- 分離方法は、単一テーブル設計または論理分割されたテーブル設計のいずれかで実装できるようにする。
- 現段階では「DynamoDB 上で分離する」ことを固定し、具体的なキー設計は実装時に詰める。

### 理由
- 低遅延な読み書きが必要
- 現在状態とイベント履歴の双方に対してスケーラブルなアクセスが必要
- MVP 段階では別ストレージ分離より構成の単純さを優先できる

## 5. 秘密情報管理のサービスマッピング

### 対象
- Slack Webhook URL
- 将来追加される外部 API 認証情報
- 環境ごとの設定値のうち秘匿すべきもの

### 採用サービス
- `AWS Secrets Manager`

### 設計方針
- 秘密情報は Secrets Manager で集中管理する。
- Lambda からは実行時に必要な秘密情報のみ参照する。
- ソースコードや通常の環境変数へ平文埋め込みしない。

## 6. 監視・ログ・通知のサービスマッピング

### ログ
- `Amazon CloudWatch Logs`

### メトリクス
- `Amazon CloudWatch Metrics`

### アラーム
- `Amazon CloudWatch Alarms`

### 通知
- `Slack Webhook`

### 設計方針
- MVP の監視は `CloudWatch Logs / Metrics / Alarms` の基本構成で十分とする。
- 高重要度障害のみ Slack Webhook へ通知する。
- ダッシュボードやフルトレーシングはこの段階では必須としない。

## 7. リソース分離方針

### 方針
- Unit 単位で論理分離する。
- AWS アカウントや VPC は共有前提でよい。

### 含意
- Step Functions ステートマシン名、Lambda 名、DynamoDB テーブル名、Secrets 名は Unit を識別できる命名にする。
- 共有基盤を使いながらも、リソース責務は Unit ごとに追跡できるようにする。

## 8. ネットワーク方針

### 基本方針
- 公開トラフィックは API Gateway で受ける。
- 内部処理は AWS マネージドサービス間連携を基本とし、追加の内部 HTTP 中継は設けない。

### 含意
- `API Gateway -> Lambda`
- `Lambda -> Step Functions`
- `Step Functions -> Lambda`
- `Lambda -> DynamoDB`
- `Lambda -> Secrets Manager`
- `Lambda -> Slack Webhook`

## 9. 共有インフラの扱い

### 現時点の判断
- 共有 AWS アカウント内で運用する。
- ただしリソース命名と責務境界は Unit 単位で明確化する。

### shared-infrastructure.md について
- 現時点では Unit 横断の共有インフラ方針を新規文書化するほどではない。
- 将来、複数 Unit で共通の API Gateway、通知基盤、監視基盤、VPC を詳細定義する段階で別紙化を検討する。

## 10. 拡張ルール適合性

### Security Baseline
- 状態: N/A
- 理由: `aidlc-state.md` で無効化されている。

### Property-Based Testing
- 状態: N/A
- 理由: この段階はインフラマッピング設計であり、PBT の適用対象ではない。
