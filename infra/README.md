# Infrastructure

`infra/` には Terraform と運用補助ドキュメントを配置します。

## 現在の内容
- [terraform](/C:/Users/user/OneDrive/Desktop/001_Project/aws-aidlc-daimonji/infra/terraform)
  - `modules/infrastructure_support/`
  - `environments/dev/`
  - `LOCAL_RUNBOOK.md`

## 主要コマンド
- `npm run terraform:fmt:check`
- `npm run terraform:validate`
- `npm run terraform:init:dev`
- `npm run terraform:plan:dev`

## 補足
- `deploy.yml` は Terraform backend 設定を Actions 変数から受け取ります。
- Lambda artifact は先に S3 へ配置した object key を使って deploy します。
