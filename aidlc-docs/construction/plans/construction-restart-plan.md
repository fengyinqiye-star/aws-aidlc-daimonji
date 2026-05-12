# Construction Restart Plan

## Purpose
This plan restarts CONSTRUCTION from the first unit while preserving previous artifacts as reference material.

## Restart Principles
- Previous Construction artifacts are reference-only and not the active baseline.
- The active baseline is the approved Inception output.
- Construction restarts from `Infrastructure and Operational Support` because the first implemented unit itself drifted from Inception.
- Remaining units proceed in the original dependency order defined during Inception.

## Restart Sequence

### Phase 1: Rebaseline the Infrastructure Unit
- Re-run `Functional Design` for `Infrastructure and Operational Support`
- Re-run `NFR Requirements`
- Re-run `NFR Design`
- Re-run `Infrastructure Design`
- Re-run `Code Generation`

Target outcomes:
- Step Functions decomposed into meaningful workflow tasks
- Lambda/task boundaries aligned with workflow steps
- Bedrock/agent runtime integration path restored to the architecture
- Amplify Hosting requirements represented in infrastructure planning
- Observability defined at task-level granularity

### Phase 2: Implement Remaining Units
- `Backend Chat Intake and Tracking`
- `Backend Negotiation and Escalation`
- `Calendar Registration`
- `Frontend Experience`

Target outcomes:
- Dedicated unit implementations under the approved top-level structure
- Frontend and backend responsibilities aligned with Inception service definitions
- Slack, Calendar, and Bedrock adapters implemented behind explicit boundaries

### Phase 3: Re-run Build and Test
- Rebuild instructions across the full unit set
- Rework integration testing to span frontend, backend, orchestration, and adapters
- Add property-based testing where applicable

## Immediate Next Stage
The next active stage is:
- `Functional Design` for `Infrastructure and Operational Support` (restart path)

## Minimum Design Changes Required in the Restarted Infrastructure Unit
- Replace the trivial Step Functions `Pass` flow with explicit task-level orchestration
- Split workflow execution into multiple task handlers instead of two coarse Lambda entrypoints
- Add infrastructure support for Bedrock-centered agent execution
- Define how Amplify Hosting fits into the deployed MVP path
- Preserve request state and event logs while improving failure localization

## Deliverables to Produce During Restart
- Revised unit design artifacts for `Infrastructure and Operational Support`
- Revised code generation plan for that unit
- New implementation slices for the remaining units
- Codex-side automation plan and automation configuration for drift monitoring (external to product implementation)
