# Infrastructure and Operational Support NFR Requirements

## Scope
This document defines the non-functional requirements for the `Infrastructure and Operational Support` unit. The unit covers workflow orchestration, request tracking, retry handling, auditability, observability, and workflow-level failure handling for the MVP.

## 1. Scalability Requirements

### Target Load
- The MVP must handle `3 to 5` concurrent requests during demo or validation usage.
- The design does not need to optimize for high-volume production traffic at this stage.

### Scaling Goal
- The unit should scale without architectural rework for small concurrent bursts.
- Capacity planning should assume short-lived peaks rather than sustained high throughput.

### Design Implication
- Stateless compute and managed orchestration are preferred.
- Shared state must support concurrent updates safely at low-to-moderate request counts.

## 2. Performance Requirements

### User-Facing Progress Updates
- Progress updates should be reflected to the user within a few seconds after a meaningful state change.
- Real-time streaming is not required, but visible delay should stay low enough for demo credibility.

### Orchestration Responsiveness
- State transition persistence and event recording should complete fast enough to keep downstream processing moving without noticeable lag.
- Retry scheduling should not block UI progress feedback.

### Design Implication
- Event writes and state updates should be lightweight and non-blocking where possible.
- The system should favor quick acknowledgement plus asynchronous continuation.

## 3. Availability Requirements

### Availability Model
- The MVP assumes a single-region deployment.
- Regional disaster recovery is not required for this phase.

### Failure Handling Expectation
- Major transient failures should be absorbed through automatic retries.
- Manual recovery is acceptable for region-wide outages or severe platform failures.

### Design Implication
- Availability investment should focus on retryable component failures, not cross-region redundancy.

## 4. Reliability Requirements

### Retry Policy
- Retryable failures should be retried automatically.
- The retry model should include a delay before re-execution rather than immediate tight loops.
- When retries are exhausted, the workflow must classify the result as `FATAL`.

### Error Visibility
- `FATAL` outcomes must be surfaced to the UI clearly.
- The UI should show a visible failure indication such as toast or equivalent explicit error presentation.

### Failure Categorization
- The system must distinguish transient infrastructure or API failures from business-logic failures.
- Only transient failures are eligible for automatic retry.

## 5. Security Requirements

### Minimum Protection Baseline
- AWS managed service standard encryption is sufficient for MVP.
- IAM-based access control is sufficient for MVP.

### Deferred Security Items
- Explicit retention and deletion policy are not mandatory in this stage.
- Data masking beyond standard controlled access is not mandatory in this stage.

### Design Implication
- Service-to-service access boundaries should still be explicit.
- Logs and audit data should avoid unnecessary exposure of sensitive raw payloads.

## 6. Observability Requirements

### Logging
- CloudWatch Logs is the minimum required logging platform.
- Logs should support troubleshooting by workflow, request, and failure event.

### Notification
- In addition to CloudWatch Logs, AI-detectable high-level failures should be forwarded to Slack via webhook.
- Slack notification is required only for high-severity operational failures, not every state transition.

### Monitoring
- Basic service metrics are required.
- Full tracing is not mandatory in this stage.

### Design Implication
- Structured logs are preferred even if full tracing is deferred.
- Failure notifications should be low-noise and targeted.

## 7. Maintainability Requirements

### Documentation and Traceability
- Workflow state changes, retry attempts, model decision summaries, and escalation reasons must remain traceable.
- NFR choices should preserve compatibility with later Infrastructure Design decisions.

### Change Flexibility
- The orchestration core may use AWS-first patterns, but non-essential service choices should remain flexible until Infrastructure Design.

## 8. Usability Requirements

### End-User Experience
- Progress visibility matters more than perfect real-time fidelity.
- Errors must be visible and understandable enough for a demo operator to explain and recover.

### Operational Experience
- Logs and notifications must make it possible to identify whether the issue is transient, business-related, or fatal.

## 9. Extension Compliance

### Security Baseline
- Status: N/A
- Rationale: The extension is disabled in `aidlc-state.md`.

### Property-Based Testing
- Status: N/A
- Rationale: This stage defines NFR expectations and tech direction only; concrete PBT targets belong to later design or testing stages.
