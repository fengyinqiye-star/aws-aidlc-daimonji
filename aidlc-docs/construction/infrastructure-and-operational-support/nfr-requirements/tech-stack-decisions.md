# Infrastructure and Operational Support Tech Stack Decisions

## Decision Summary
The unit will stay AWS-oriented, but only the orchestration core is fixed at this stage. Other detailed service mappings may stay flexible until Infrastructure Design.

## 1. Confirmed Direction

### Orchestration
- `AWS Step Functions` remains the primary orchestration candidate.
- Reason:
  - The unit centers on state transitions, retries, waiting, and branching.
  - The workload is asynchronous and workflow-driven.
  - The MVP needs visible orchestration behavior more than custom workflow runtime logic.

### Compute
- `AWS Lambda` remains the primary execution candidate for workflow tasks.
- Reason:
  - MVP concurrency is low to moderate.
  - Stateless execution is sufficient for orchestration-adjacent operations.
  - Lambda aligns with event-driven processing and small operational overhead.

### State and Tracking
- `Amazon DynamoDB` remains the primary tracking-store candidate.
- Reason:
  - Request state and event history fit key-value/document access patterns.
  - Low-latency reads and writes support quick progress updates.
  - Small concurrent workloads do not justify a heavier relational dependency yet.

### Logging and Metrics
- `Amazon CloudWatch Logs` and basic `CloudWatch Metrics` remain the default observability baseline.
- Reason:
  - They satisfy MVP logging and basic monitoring needs.
  - They integrate naturally with Lambda and Step Functions.

## 2. Additional Operational Choice

### Failure Notification
- `Slack Webhook` is the preferred notification mechanism for AI-detectable high-severity failures.
- Reason:
  - The user explicitly requested Slack-based notification for higher-severity failures.
  - It provides lightweight operational visibility without introducing a full alerting platform.

## 3. Deferred Decisions

The following decisions are intentionally deferred to Infrastructure Design:

- Whether to place `API Gateway` in front of all orchestration entry points or only selected ones
- Whether any request tracking or event history should also be mirrored to another datastore
- Whether tracing should use AWS X-Ray or another mechanism
- Exact alert routing, retry notification thresholds, and log retention settings
- Whether any components should move from Lambda to container-based runtime

## 4. Constraints

### Performance Constraint
- The stack must support visible state changes within a few seconds.

### Availability Constraint
- The stack only needs single-region resilience with retry-based recovery for transient faults.

### Security Constraint
- Managed encryption and IAM control are sufficient for MVP.

### Operational Constraint
- Fatal failures must be observable in both CloudWatch and Slack notification flow.

## 5. Non-Decisions at This Stage

The following are not fixed yet:

- Detailed network topology
- Secret storage mechanism selection beyond AWS-managed expectation
- API surface partitioning across services
- Exact webhook relay implementation pattern

These should be finalized in `Infrastructure Design`, not earlier.
