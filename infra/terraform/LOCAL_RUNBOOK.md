# Infrastructure Support Local Runbook

## Local Commands
- `npm run backend:check`
- `npm run terraform:fmt:check`
- `npm run terraform:validate`
- `npm run terraform:init:dev`
- `npm run terraform:plan:dev`

## Required AWS Console Setup
- Create a GitHub Actions OIDC provider for `token.actions.githubusercontent.com`.
- Create an IAM role for GitHub Actions and expose its ARN as repository variable `AWS_DEPLOY_ROLE_ARN`.
- Create an S3 bucket for Terraform remote state and expose it as `TERRAFORM_STATE_BUCKET`.
- Create a DynamoDB table for Terraform state locking and expose it as `TERRAFORM_LOCK_TABLE`.
- Create an S3 bucket for Lambda deployment artifacts and expose it as `LAMBDA_ARTIFACT_BUCKET`.
- Register the Slack webhook secret in AWS Secrets Manager and expose its name as `SLACK_WEBHOOK_SECRET_NAME`.

## GitHub Repository Variables
- `AWS_REGION`
- `AWS_DEPLOY_ROLE_ARN`
- `TERRAFORM_STATE_BUCKET`
- `TERRAFORM_LOCK_TABLE`
- `TERRAFORM_NAME_PREFIX`
- `LAMBDA_ARTIFACT_BUCKET`
- `SLACK_WEBHOOK_SECRET_NAME`

## Notes
- `deploy.yml` assumes Terraform state backend settings are provided at runtime.
- `terraform:plan:dev` expects a local `terraform.tfvars` copied from `infra/terraform/environments/dev/terraform.tfvars.example`.
