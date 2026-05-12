# Construction Restart Gap Analysis

## Purpose
This document identifies drift between approved INCEPTION artifacts and the current CONSTRUCTION outputs. It defines which parts of CONSTRUCTION must be rerun and why.

## Source Artifacts Reviewed
- `aidlc-docs/inception/requirements/requirements.md`
- `aidlc-docs/inception/application-design/`
- `aidlc-docs/inception/application-design/unit-of-work.md`
- `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- `aidlc-docs/inception/plans/execution-plan.md`
- Current implementation under `backend/`, `frontend/`, `infra/`, and `shared/`

## Executive Summary
The current implementation proves that a minimal infrastructure slice can be deployed, but it does not satisfy the Construction scope implied by the approved Inception artifacts. The main mismatch is that only a thin `Infrastructure and Operational Support` slice was implemented, while the agreed system requires five units of work and an AWS-native multi-agent architecture with frontend hosting, Bedrock-based agent execution, and step-level workflow decomposition.

## Drift Findings

### 1. Missing Units of Work
The approved unit breakdown requires the following units:
- `Frontend Experience`
- `Backend Chat Intake and Tracking`
- `Backend Negotiation and Escalation`
- `Calendar Registration`
- `Infrastructure and Operational Support`

Current implementation status:
- Only `Infrastructure and Operational Support` has meaningful code and IaC.
- `frontend/` contains no React/Vite/Tailwind application implementation.
- `backend/chat-intake/`, `backend/negotiation/`, `backend/calendar-registration/`, and `backend/tracking/` do not exist as implemented units.

Impact:
- Construction did not proceed in the approved dependency order beyond the first unit.
- Build and Test cannot be considered representative of the approved MVP scope.

### 2. Bedrock / Agent Runtime Drift
Approved Inception direction:
- Backend execution should be centered on `Bedrock AgentCore Runtime`.
- Multi-agent scope includes at least an orchestrator and a lawyer sub-agent.

Current implementation status:
- No Bedrock resources or runtime integration are deployed.
- No orchestrator-to-agent runtime boundary exists beyond a generic Step Functions starter.
- No lawyer sub-agent execution path is implemented.

Impact:
- The architecture does not satisfy the agreed product and architecture requirements.
- The negotiation and escalation flows cannot be validated as designed.

### 3. Frontend / Amplify Hosting Drift
Approved Inception direction:
- Frontend stack is `React + TypeScript + Vite + Tailwind CSS`.
- Hosting should be `AWS Amplify Hosting`.

Current implementation status:
- No frontend application exists.
- No Amplify Hosting resources or deployment path exist in Terraform or CI/CD.

Impact:
- The user-facing MVP path is absent.
- The deployed system currently validates only API access, not the agreed product experience.

### 4. Step Functions Orchestration Drift
Approved Inception direction:
- Step Functions should manage a multi-step workflow including intent extraction, missing-information checks, calendar loading, score calculation, negotiation plan generation, Slack draft generation, review wait, posting, calendar registration, and status updates.

Current implementation status:
- The state machine is a single `Pass` state named `AcceptRequest`.
- Only two Lambda functions exist: request start and request status retrieval.

Impact:
- Step Functions is not functioning as the workflow orchestrator described in Inception.
- Failures cannot be localized to meaningful workflow steps.
- The infrastructure does not yet support observability at the step granularity required for demo explanation and troubleshooting.

### 5. Adapter / Integration Drift
Approved Inception direction:
- Slack, Google Calendar, and agent runtime integrations should be adapter-separated and swappable.

Current implementation status:
- Only Slack webhook secret plumbing exists.
- No real Slack negotiation workflow, Google Calendar registration workflow, or Bedrock adapter implementation exists.

Impact:
- The intended boundary between orchestration, domain services, and external adapters is only partially realized.

### 6. Property-Based Testing Drift
Approved Inception direction:
- Property-Based Testing is enabled and mandatory in later applicable stages.

Current implementation status:
- Current tests are example-based only.
- No PBT strategy or framework integration exists in the generated code or test instructions.

Impact:
- Construction output is not compliant with enabled extension expectations where applicable.

### 7. Codex Automation Drift
Approved workflow need:
- A recurring loop should detect phase drift across Inception, Construction, and Operations and register issues automatically.

Current implementation status:
- No Codex automation exists for phase drift detection.
- No issue registration automation path is configured.

Impact:
- Future drift will recur without an automated guardrail.

## Restart Scope Decision
Construction must restart from the beginning of the CONSTRUCTION phase.

### Rationale
- The first implemented unit itself is architecturally incomplete relative to Inception.
- Later units were never implemented.
- Build and Test was reached before the approved unit sequence and scope were satisfied.

## Required Restart Order
1. `Infrastructure and Operational Support`
2. `Backend Chat Intake and Tracking`
3. `Backend Negotiation and Escalation`
4. `Calendar Registration`
5. `Frontend Experience`
6. `Build and Test`

## Construction Restart Goals
- Rework the infrastructure unit so that Bedrock/agent runtime, Amplify Hosting enablement, and meaningful Step Functions task decomposition are part of the designed path.
- Resume the remaining units in the approved dependency order.
- Add a Codex automation loop that periodically checks for phase drift and opens GitHub issues when drift is detected.
