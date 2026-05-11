# aws-aidlc-daimonji

有休交渉 MVP の AI-DLC 管理リポジトリです。現在は `CONSTRUCTION` フェーズで、最初の Unit `Infrastructure and Operational Support` の実装を進めています。

## 現在の実装範囲
- `backend/infrastructure-support/`
  - API Handler
  - Workflow starter
  - DynamoDB repository
  - failure / retry / notification logic
  - API Gateway Lambda entrypoint
  - Step Functions / DynamoDB 向け AWS runtime adapter
- `infra/terraform/`
  - API Gateway
  - Lambda
  - Step Functions
  - DynamoDB
  - Secrets Manager
  - CloudWatch
  - IAM
- `.github/workflows/`
  - `ci.yml`
  - `deploy.yml`
- `aidlc-docs/`
  - Inception 成果物
  - Construction 設計成果物
  - code summary / operator setup

## よく使うコマンド
- `npm run backend:check`
- `npm run build`
- `npm run test:unit`
- `npm run test:integration`
- `npm run terraform:fmt:check`
- `npm run terraform:validate`

## CI/CD
- CI: `.github/workflows/ci.yml`
  - backend unit
  - backend integration
  - terraform format / validate
- CD: `.github/workflows/deploy.yml`
  - GitHub Actions OIDC で AWS role を assume
  - Terraform apply を `workflow_dispatch` で実行

## AWS Console で必要なもの
- GitHub Actions OIDC Provider
- GitHub Actions deploy role
- Terraform state 用 S3 bucket
- Terraform lock 用 DynamoDB table
- Lambda artifact 用 S3 bucket
- Slack webhook 用 Secrets Manager secret

詳細は [LOCAL_RUNBOOK.md](/C:/Users/user/OneDrive/Desktop/001_Project/aws-aidlc-daimonji/infra/terraform/LOCAL_RUNBOOK.md) と [operator-setup.md](/C:/Users/user/OneDrive/Desktop/001_Project/aws-aidlc-daimonji/aidlc-docs/construction/infrastructure-and-operational-support/code/operator-setup.md) を参照してください。
