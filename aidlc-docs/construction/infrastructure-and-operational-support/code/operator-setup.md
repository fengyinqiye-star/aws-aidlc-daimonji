# Infrastructure and Operational Support Operator Setup

## AWS Console Prerequisites
1. Create the GitHub Actions OIDC provider.
2. Create the GitHub Actions deploy role.
3. Create the Terraform remote state S3 bucket.
4. Create the Terraform lock DynamoDB table.
5. Create the Lambda artifact S3 bucket.
6. Store the Slack webhook secret in Secrets Manager.

## Local Developer Entry Points
- `npm run backend:check`
- `npm run terraform:fmt:check`
- `npm run terraform:validate`
- `npm run terraform:init:dev`
- `npm run terraform:plan:dev`

## Known Gaps
- Local Terraform execution requires a separately installed Terraform CLI.
- Lambda artifact upload automation is not yet wired into `deploy.yml`; the workflow expects existing S3 object keys.
