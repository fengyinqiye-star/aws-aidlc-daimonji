# Infrastructure and Operational Support Code Summary

## Generated Application Code
- `backend/infrastructure-support/src/api/`
  - `StartRequestHandler`
  - `GetRequestStatusHandler`
- `backend/infrastructure-support/src/workflow/`
  - workflow starter
  - retry policy
  - orchestration boundary
- `backend/infrastructure-support/src/repositories/`
  - request state repository
  - request event log repository
  - DynamoDB-oriented implementations
- `backend/infrastructure-support/src/resilience/`
  - failure classifier
  - retry coordinator
- `backend/infrastructure-support/src/notifications/`
  - notification aggregator
- `backend/infrastructure-support/src/adapters/`
  - Secrets Manager reader
  - Slack webhook relay
- `backend/infrastructure-support/src/runtime/`
  - AWS Document DynamoDB client
  - Step Functions orchestrator
- `backend/infrastructure-support/src/lambda/`
  - API Gateway Lambda entrypoints for start request and request status

## Shared Contracts
- `shared/types/src/index.ts`
- `shared/adapters/src/index.ts`

## Key Design Decisions Captured in Code
- Public entry is `API Gateway -> Lambda -> Step Functions`.
- Request state and event log are separated by repository responsibility.
- Event log queries filter on `EVENT#` sort key prefix.
- API handlers depend on ports rather than concrete workflow internals.
