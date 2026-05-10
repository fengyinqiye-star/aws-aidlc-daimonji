# Infrastructure and Operational Support Code Generation Plan

## Unit Context
- Unit name: `Infrastructure and Operational Support`
- Stories supported by this unit:
  - `US-01` の Supporting Unit
  - `US-02` の Supporting Unit
- Responsibilities:
  - 公開入口からのワークフロー開始
  - Step Functions を使った状態遷移と再試行制御
  - Request State / Event Log の基盤実装
  - 高重要度障害の監視・通知基盤
  - Terraform と GitHub Actions による CI/CD 足回り
- Dependencies on other units:
  - `Backend Chat Intake and Tracking` が後続で呼び出す入口・状態管理基盤を提供する
  - `Backend Negotiation and Escalation` が後続で利用するワークフロー制御・通知基盤を提供する
  - `Calendar Registration` が後続で利用する状態更新・再試行基盤を提供する

## Planned Code Locations
- Application code:
  - `backend/infrastructure-support/src/`
  - `backend/infrastructure-support/tests/`
  - `shared/types/`
  - `shared/adapters/`
  - `infra/terraform/`
  - `.github/workflows/`
- Documentation summaries:
  - `aidlc-docs/construction/infrastructure-and-operational-support/code/`

## AWS Console Setup Items
- GitHub Actions から AWS へ OIDC 連携するための IAM OIDC Provider
- GitHub Actions 用 IAM Role
- Terraform 状態管理用 S3 Bucket
- Terraform state lock 用 DynamoDB Table
- Slack Webhook 値の Secrets Manager 登録
- 必要なら API Gateway / Lambda / Step Functions / CloudWatch の権限境界確認

## Execution Steps

### Step 1
- [x] Create greenfield project structure for this unit under `backend/infrastructure-support/`, `shared/`, `infra/terraform/`, and `.github/workflows/`.
- Story traceability: `US-01`, `US-02`

### Step 2
- [x] Generate shared domain and contract types for request state, event log, failure classification, retry policy, and workflow start payloads under `shared/types/`.
- Story traceability: `US-01`, `US-02`

### Step 3
- [x] Generate application-level workflow starter and orchestration boundary code under `backend/infrastructure-support/src/` for `API Gateway -> Lambda -> Step Functions`.
- Story traceability: `US-01`, `US-02`

### Step 4
- [x] Generate request state and event log repository layer abstractions and DynamoDB-oriented implementations under `backend/infrastructure-support/src/`.
- Story traceability: `US-01`, `US-02`

### Step 5
- [ ] Generate failure classification, retry policy coordination, and notification aggregation logic under `backend/infrastructure-support/src/`.
- Story traceability: `US-01`, `US-02`

### Step 6
- [ ] Generate Slack high-severity notification relay and Secrets Manager access adapter code under `shared/adapters/` and `backend/infrastructure-support/src/`.
- Story traceability: `US-01`, `US-02`

### Step 7
- [ ] Generate API layer entry handlers for infrastructure-support-owned public endpoints and workflow start endpoints under `backend/infrastructure-support/src/`.
- Story traceability: `US-01`, `US-02`

### Step 8
- [ ] Generate business logic unit tests for workflow start, state transitions, failure classification, retry behavior, and notification aggregation under `backend/infrastructure-support/tests/`.
- Story traceability: `US-01`, `US-02`

### Step 9
- [ ] Generate integration-style tests for repository persistence behavior and workflow boundary contracts under `backend/infrastructure-support/tests/`.
- Story traceability: `US-01`, `US-02`

### Step 10
- [ ] Generate Terraform modules and environment composition for API Gateway, Lambda, Step Functions, DynamoDB, Secrets Manager, CloudWatch, and IAM under `infra/terraform/`.
- Story traceability: `US-01`, `US-02`

### Step 11
- [ ] Generate GitHub Actions CI workflow to run unit and integration tests, plus Terraform validation/format/plan checks, using separate responsibility-based jobs.
- Story traceability: `US-01`, `US-02`

### Step 12
- [ ] Generate GitHub Actions CD workflow or document fallback to AWS-native deployment services if GitHub Actions alone is insufficient for safe deployment.
- Story traceability: `US-01`, `US-02`

### Step 13
- [ ] Generate local wrapper commands and minimal README or runbook updates for CI parity, Terraform usage, and required AWS Console setup.
- Story traceability: `US-01`, `US-02`

### Step 14
- [ ] Generate code-stage documentation summary files under `aidlc-docs/construction/infrastructure-and-operational-support/code/` describing produced code, tests, Terraform, CI/CD, and operator setup.
- Story traceability: `US-01`, `US-02`

### Step 15
- [ ] Update README files at workspace root and under `backend/`, `frontend/`, and `infra/` to reflect generated application structure, CI/CD usage, Terraform usage, and developer/operator entry points.
- Story traceability: `US-01`, `US-02`

## Notes
- This plan is the single source of truth for Code Generation Part 2.
- CI must include単体テストと結合テストを含める。
- If GitHub Actions-only deployment introduces unsafe secret handling or unacceptable AWS coupling, the fallback is to keep CI in GitHub Actions and use AWS deployment services only for CD execution.
