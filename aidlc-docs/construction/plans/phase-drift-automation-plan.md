# Phase Drift Automation Plan

## Purpose
Add a Codex-side recurring automation loop that detects drift between approved phase artifacts and the actual repository state, then registers GitHub issues automatically.

## Boundary
- This automation is external to the application implementation tracked by AI-DLC.
- It is not part of any product unit's Functional Design, Infrastructure Design, or Code Generation scope.
- AI-DLC artifacts define only the operating policy for this automation; creation and execution happen on the Codex side.

## Drift Monitoring Scope

### Inception Drift Checks
- Requirements vs implemented architecture
- Application design vs actual unit boundaries
- Unit-of-work definitions vs actual repository structure
- Execution plan vs actual completed Construction scope

### Construction Drift Checks
- Implemented units vs approved unit sequence
- Infrastructure design vs deployed IaC
- Code generation outputs vs approved functional/NFR/infrastructure design
- Build and Test scope vs actual implemented units

### Operations Drift Checks
- Deployment/runbook expectations vs actual deployed resources
- Monitoring/documentation expectations vs actual observable setup
- Automation/runbook coverage gaps

## Detection Method
- Read `aidlc-docs/aidlc-state.md`
- Read approved Inception and Construction artifacts relevant to the current lifecycle phase
- Inspect repository structure, key implementation paths, and Terraform definitions
- Compare expected components/resources/units against actual ones
- Classify drift by severity:
  - `Blocking`: prevents the approved MVP from being considered aligned
  - `Material`: significant mismatch that should be corrected soon
  - `Minor`: documentation or sequencing mismatch

## Issue Registration Policy
- Open a GitHub issue automatically when new `Blocking` or `Material` drift is detected
- Reuse/update an existing open drift issue if one already tracks the same gap
- Include in each issue:
  - Drift title
  - Phase where the expectation originated
  - Expected artifact/reference
  - Actual repository or infrastructure state
  - Recommended next action

## Proposed Automation Shape
- **Automation type**: Cron automation
- **Workspace**: repository root
- **Cadence assumption**: daily
- **Suggested name**: `ai-dlc-phase-drift-monitor`
- **Destination**: current Codex thread or a dedicated monitoring thread

## Proposed Automation Prompt
Run a phase drift audit for the AI-DLC project in this workspace.

1. Read `aidlc-docs/aidlc-state.md`.
2. Based on the current lifecycle phase, load the relevant approved Inception and Construction artifacts.
3. Compare the approved phase outputs with:
   - repository structure
   - application code
   - Terraform/IaC
   - CI/CD workflows
   - runbooks
4. Identify any `Blocking`, `Material`, or `Minor` drift.
5. For each new `Blocking` or `Material` drift:
   - check whether a matching open GitHub issue already exists
   - if not, create a new GitHub issue
   - if yes, add an update comment instead of duplicating
6. Summarize all findings in the automation result.

## Prerequisites
- GitHub issue creation access from the automation environment
- Stable repository path in the automation workspace
- Drift issue naming convention or label, e.g. `aidlc-drift`

## Current Recommendation
- Create the automation after the restart path is accepted
- Start with daily cadence
- Limit automatic issue creation to `Blocking` and `Material` drift to avoid noise
