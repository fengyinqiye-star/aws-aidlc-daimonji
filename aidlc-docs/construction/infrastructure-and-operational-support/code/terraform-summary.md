# Infrastructure and Operational Support Terraform Summary

## Terraform Layout
- `infra/terraform/modules/infrastructure_support/`
- `infra/terraform/environments/dev/`
- `infra/terraform/providers.tf`
- `infra/terraform/LOCAL_RUNBOOK.md`

## Managed Resources
- HTTP API (`aws_apigatewayv2_api`, routes, stage)
- Lambda functions for request start and request status
- Step Functions state machine
- DynamoDB request state table
- DynamoDB request event log table
- Secrets Manager secret for Slack webhook
- CloudWatch log groups
- IAM roles and inline policies

## Deployment Assumptions
- Lambda ZIP artifacts are uploaded to S3 before `deploy.yml` is run.
- Terraform remote state bucket and lock table are supplied at init time.
- MVP uses a single `dev` environment composition.
