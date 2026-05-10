# Infrastructure and Operational Support CI/CD Summary

## CI Workflow
- File: `.github/workflows/ci.yml`
- Jobs:
  - `backend-unit`
  - `backend-integration`
  - `terraform`
  - `report`

## CD Workflow
- File: `.github/workflows/deploy.yml`
- Trigger:
  - `workflow_dispatch`
- Deployment flow:
  - assume AWS role with OIDC
  - initialize Terraform backend
  - apply `infra/terraform/environments/dev`

## Repository Variables Required
- `AWS_REGION`
- `AWS_DEPLOY_ROLE_ARN`
- `TERRAFORM_STATE_BUCKET`
- `TERRAFORM_LOCK_TABLE`
- `TERRAFORM_NAME_PREFIX`
- `LAMBDA_ARTIFACT_BUCKET`
- `SLACK_WEBHOOK_SECRET_NAME`
