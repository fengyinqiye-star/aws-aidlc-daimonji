# Infrastructure and Operational Support NFR Requirements

## 概要
本書は `Infrastructure and Operational Support` Unit の restarted NFR を定義する。対象は Step Functions によるタスク分解、Bedrock AgentCore Runtime を含むエージェント実行、request tracking、task 単位監視、Frontend 連携用公開 API 契約である。

## 1. スケーラビリティ要件

### 同時処理前提
- MVP の基準同時 request 数は `3〜5件程度` とする
- 単一デモ用の一時的負荷ではなく、複数 request が同時進行しても状態追跡と障害切り分けが成立することを重視する

### スケーリング方針
- MVP では単一リージョン構成を前提とする
- オーケストレーション、task 実行、状態保存が個別に伸縮できる構造を維持する
- Bedrock 呼び出しは task 境界で隔離し、他の処理系と独立に負荷を観測できるようにする

## 2. パフォーマンス要件

### API 応答
- `POST /requests` の初回応答は数秒以内を目標とする
- `GET /requests/{requestId}` の読み取り応答も数秒以内を目標とする

### 進行表示
- workflow の主要状態更新は数秒以内に UI から観測できることを目標とする
- event log 反映遅延はデモ説明に支障がない範囲に抑える

### Bedrock 呼び出し
- Bedrock AgentCore Runtime 呼び出しは全体の遅延要因として分離観測できること
- 初回応答速度を守るため、長時間推論は同期 API 応答に含めない

## 3. 可用性要件

### リージョン方針
- MVP は単一リージョン前提とする
- リージョン障害時の継続提供は MVP の必須要件にしない

### 障害時挙動
- 単一リージョン障害や一時的 AWS 障害では、再試行と明示的失敗表示を優先する
- `TransientFailure` は自動再試行対象とする
- 重大障害時は UI へ `FATAL` 状態または復旧待ちが明示されること

### Bedrock 障害
- Bedrock AgentCore Runtime 障害は `AgentRuntimeFailure` として明示的に分類する
- Bedrock 障害時は縮退応答ではなく、再試行または人間レビューへのフォールバックを優先する

## 4. セキュリティ要件

### 情報保護方針
- 交渉文面、法務助言、Slack thread 情報は機微情報として扱う
- 構造化ログへの出力は最小限に制限する
- 機微本文は必要最小限のみ保存する

### マスキング
- 機微情報マスキング方針はこの段階で定義対象に含める
- 少なくともログ、通知、障害サマリでは全文露出を避ける

### 資格情報
- AWS マネージドサービス標準暗号化と IAM 制御を MVP 最低ラインとする
- Slack Webhook などの秘密情報はシークレット管理を前提とする

## 5. 信頼性要件

### 障害分類
- `TransientFailure` / `BusinessFailure` / `IntegrationFailure` / `AgentRuntimeFailure` / `FatalFailure` を維持する
- 障害分類は task 単位で観測・記録されること

### 再試行
- 自動再試行は `TransientFailure` のみ
- retry exhaustion 後は `FatalFailure` または明示的失敗状態に昇格する

### 状態整合性
- request 現在状態と event log は整合した形で保持されること
- task 実行記録は requestId と taskName で追跡可能であること

## 6. 可観測性要件

### 基本監視
- `CloudWatch Logs / Metrics / Alarm` を task 単位で持つ
- Step Functions 実行全体よりも、まず task 単位での失敗局所化を重視する

### 通知
- 高重要度障害のみ Slack Webhook で通知する
- すべてのログイベントを Slack へ転送してはならない

### 追跡粒度
- Lambda、Step Functions、Bedrock 呼び出しのどこで失敗したかを区別できること
- デモ時の説明責任を満たすため、失敗理由と再試行有無が辿れること

## 7. Frontend 連携要件

### 公開契約
- Frontend Unit 向けに以下を固定する
  - API Base URL
  - 主要 endpoint
  - 必要 environment variable 名

### Amplify 前提
- Amplify Hosting の詳細 IaC は後続 Unit に委ねる
- ただし Frontend が接続前提を失わないよう、公開契約はこの Unit の NFR として固定する

## 8. 保守性要件

### 責務分離
- API 入口、task 実行、エージェント実行、状態保存、通知処理は分離された責務として維持する
- 失敗局所化のため、1 task に複数の主要責務を混在させない

### ドキュメント
- Frontend 連携契約、障害分類、通知方針、シークレット方針を後続 Unit が参照できる形で保持する

## 9. PBT 要件

### Framework 方針
- TypeScript 実装の PBT framework は `fast-check` を第一候補として正式採用する
- この選定は Code Generation での test 生成と CI 組み込みの前提になる

### 適用対象
- workflow state projection
- retry / failure classification
- request/event serialization
- frontend runtime contract serialization

## 10. 今回の段階で固定しない事項
- マルチリージョン冗長化
- Bedrock 以外の推論基盤追加
- Amplify Hosting の詳細リソース設計
- 分散トレーシングの具体実装

## 拡張ルール適用状況

### Security Baseline
- 状態: N/A
- 理由: `aidlc-state.md` で無効化されている

### Property-Based Testing
- 状態: Compliant
- 理由: PBT-09 に従い、TypeScript 用 framework として `fast-check` を正式採用対象に定義した
