# Unit of Work 依存関係

## 依存関係サマリー

| Unit | 依存先 | 依存理由 | 優先度 |
|---|---|---|---|
| Frontend Experience | Backend Chat Intake and Tracking, Backend Negotiation and Escalation, Calendar Registration | API 応答と状態表示が必要 | High |
| Backend Chat Intake and Tracking | Infrastructure and Operational Support | API / workflow / persistence 基盤が必要 | High |
| Backend Negotiation and Escalation | Backend Chat Intake and Tracking, Infrastructure and Operational Support | リクエスト状態と Adapter 基盤が必要 | High |
| Calendar Registration | Backend Chat Intake and Tracking, Backend Negotiation and Escalation, Infrastructure and Operational Support | 成立判定、確認フロー、Calendar Adapter が必要 | High |
| Infrastructure and Operational Support | なし | 基盤単位のため起点となる | Critical |

## 依存関係の詳細

### 1. Frontend Experience
- **依存先**:
  - Backend Chat Intake and Tracking
  - Backend Negotiation and Escalation
  - Calendar Registration
- **理由**:
  - チャット進行 API が必要
  - 交渉要約と Slack レビュー情報が必要
  - Calendar 登録確認と登録結果表示が必要

### 2. Backend Chat Intake and Tracking
- **依存先**:
  - Infrastructure and Operational Support
- **理由**:
  - API 公開、Step Functions 接続、永続化、ログ基盤が必要

### 3. Backend Negotiation and Escalation
- **依存先**:
  - Backend Chat Intake and Tracking
  - Infrastructure and Operational Support
- **理由**:
  - リクエスト状態、会話履歴、Adapter とエージェント実行基盤が必要

### 4. Calendar Registration
- **依存先**:
  - Backend Chat Intake and Tracking
  - Backend Negotiation and Escalation
  - Infrastructure and Operational Support
- **理由**:
  - 交渉成立状態、確認フロー、Calendar Adapter、Secrets が必要

### 5. Infrastructure and Operational Support
- **依存先**: なし
- **理由**:
  - 他単位が利用する実行基盤を提供する

## 推奨実装順
1. Infrastructure and Operational Support
2. Backend Chat Intake and Tracking
3. Backend Negotiation and Escalation
4. Calendar Registration
5. Frontend Experience

## 並行化可能性
- Infrastructure が固まった後は、Frontend Experience と Backend Negotiation の一部詳細設計は並行可能
- ただし Calendar Registration は Backend Negotiation の成立結果定義に依存する

## 通信パターン
- Frontend Experience <-> Backend API
- Backend Chat Intake and Tracking <-> Persistence / Workflow
- Backend Negotiation and Escalation <-> Slack / Team Schedule / Agent Runtime
- Calendar Registration <-> Google Calendar
- 全単位 <-> Observability / Logging
