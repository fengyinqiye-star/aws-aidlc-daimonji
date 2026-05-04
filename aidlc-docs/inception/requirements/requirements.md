# Requirements Document

## Intent Analysis Summary
- **User Request**: Build an AWS hackathon MVP web app named `AIが決めたんで。` that runs a chat-driven paid leave coordination workflow and posts a stakeholder-thread to Slack after AI-supported analysis and user review.
- **Request Type**: New Project
- **Scope Estimate**: System-wide greenfield application spanning frontend, backend workflow orchestration, AI integration, persistence, and external adapters
- **Complexity Estimate**: Complex
- **Requirements Depth**: Comprehensive

## Product Vision
`AIが決めたんで。` is an AI agent web application that helps users delegate difficult leave-coordination conversations to AI. The MVP focuses only on paid leave coordination and uses chat as the main interaction model. The system must collect missing information through conversation, evaluate calendar and team impact, generate negotiation guidance, and prepare a Slack coordination thread that the user reviews before posting.

## Business Goals
- Deliver a hackathon demo that reliably shows an end-to-end leave-coordination workflow.
- Demonstrate that the product is an AI-agent application, not just a Slack bot.
- Show credible AWS-native architecture using Amplify, API Gateway, backend runtime, Step Functions, DynamoDB, Bedrock, Secrets Manager, and CloudWatch.
- Preserve future extensibility toward other "AI says the hard thing for you" workflows.

## Success Criteria
- The user can enter a natural-language request such as `来週金曜休みたい`.
- The AI can ask follow-up questions when mode, date, reason, or destination details are missing.
- The system can suggest easier-to-take leave dates when the request is underspecified.
- The UI shows vacation score, business impact, affected meetings, substitute candidates, reasoning, and current status.
- The system can generate a Slack message for review and post a stakeholder-mention thread to an actual Slack workspace in the demo.
- The request status updates to the negotiation state after posting.
- Workflow progress is observable through Step Functions and/or CloudWatch.

## User Decisions Captured
- **Calendar integration for MVP**: Google Calendar only
- **Backend runtime direction**: Bedrock AgentCore Runtime centered architecture
- **Slack posting mode**: Real Slack posting required in demo
- **Authentication**: No authentication required for MVP demo
- **Multi-agent scope**: Include a minimal working orchestrator and lawyer sub-agent path
- **Demo priority**: Show real Slack posting and AI-driven negotiation behavior
- **Security extension**: Disabled for this project
- **Property-based testing extension**: Enabled as blocking for applicable later stages

## In Scope
- Chat-first UI for leave coordination
- Natural-language input parsing for desired date, leave mode, reason, urgency, stakeholders, and Slack destination
- AI follow-up questioning for missing information
- Leave mode support:
  - `絶対休めるモード`
  - `できれば休みたいモード`
  - `バレずに休みたいモード` with explicit prohibition on deception or false reasons
- AI suggestion of easy-to-take leave dates when date is missing or flexible
- Vacation feasibility scoring from `0` to `100`
- Business impact assessment using `Low`, `Medium`, `High`
- Analysis result display including reasoning, affected meetings, and substitute candidates
- Slack message generation, review, edit, and posting
- Slack stakeholder mention thread creation
- Status lifecycle management
- Multi-agent orchestration with at least one escalation path to a lawyer-style sub-agent
- External integration adapters separated for future MCP replacement
- Demo fallback behavior for Bedrock, Slack, and Google Calendar failures

## Out of Scope
- Attendance or HR leave system integration
- Formal paid leave application workflow
- Full Slack reply automation
- Production-grade authentication and authorization
- Full MCP server implementation
- Future "decline drinking party" or other non-leave modes beyond extension-ready design

## Primary Personas
- **Requester**: Employee who wants AI to handle uncomfortable leave coordination through chat.
- **Stakeholder / Approver**: Team members or leads mentioned in Slack who need clear context and substitute proposals.
- **Demo Operator**: Presenter who needs stable fallback paths, seeded demo data, and observable workflow execution.

## Functional Requirements

### FR-01 Chat Experience
- The application shall provide a chat interface as the primary workflow entry point.
- The application shall persist chat sessions and messages for each leave coordination flow.
- The chat shall support natural-language requests in Japanese.
- The AI shall respond conversationally and collect missing information before analysis.

### FR-02 Intent Extraction
- The system shall extract or infer:
  - desired leave date or date range
  - leave mode
  - leave reason phrasing
  - urgency
  - Slack posting destination if provided
  - relevant stakeholders if provided or inferable
- If the user provides only a date or an incomplete request, the AI shall ask follow-up questions.
- If the user asks for an unspecified day in a broader time window, the AI shall propose candidate dates based on schedule analysis.

### FR-03 Leave Modes
- The system shall support the three MVP leave modes with mode-specific behavior.
- In `絶対休めるモード`, the system shall optimize for achieving leave and generate concrete delegation proposals.
- In `できれば休みたいモード`, the system shall frame coordination as consultation and offer alternatives when impact is high.
- In `バレずに休みたいモード`, the system shall optimize for low-impact natural leave timing without generating deceptive or false justifications.
- The system shall allow the user to explicitly set a mode even if the AI inferred one.

### FR-04 Schedule Analysis
- The system shall retrieve Google Calendar data for the target user in the MVP.
- The system shall retrieve team schedule information from demo data and/or application-managed records.
- The system shall identify affected meetings, participation importance, rescheduling flexibility, and substitute candidates.
- The system shall fall back to demo schedule data when Google Calendar access fails.

### FR-05 Scoring and Business Impact
- The system shall calculate a vacation feasibility score between `0` and `100`.
- The score shall consider meeting count, meeting importance, ownership, substitute availability, reschedulability, team availability, leave mode, and urgency.
- The system shall classify business impact as `Low`, `Medium`, or `High`.
- The system shall display a human-readable explanation of the score and impact assessment.

### FR-06 Negotiation Planning
- The system shall generate a negotiation strategy tailored to the selected leave mode and analysis outcome.
- The system shall produce substitute candidate suggestions and concrete asks for affected stakeholders.
- For low-feasibility scenarios in `絶対休めるモード`, the system shall be able to escalate to a lawyer-style sub-agent through the orchestrator.

### FR-07 Slack Review and Posting
- The system shall generate a Slack post draft containing:
  - desired leave date
  - leave mode
  - feasibility score
  - business impact
  - AI reasoning summary
  - substitute candidates
  - stakeholder asks
  - the phrase `AIが決めたんで。`
- The user shall be able to review and edit the Slack message before sending.
- The system shall post to a real Slack workspace for the hackathon demo.
- The system shall create or simulate a stakeholder mention thread tied to the leave request.
- The system shall show an error in the UI if Slack posting fails.

### FR-08 Workflow and Status Management
- The system shall track request statuses using:
  - `DRAFT`
  - `COLLECTING_INFO`
  - `ANALYZING`
  - `REVIEW_REQUIRED`
  - `NEGOTIATING`
  - `APPROVED`
  - `NEEDS_REPLAN`
  - `FAILED`
- The system shall move requests through the workflow based on user input and orchestration results.
- The system shall expose request detail views including status history, analysis, and Slack posting history.

### FR-09 Orchestration Workflow
- The system shall orchestrate the following logical steps using AWS Step Functions:
  - `ReceiveChatMessage`
  - `ExtractVacationIntent`
  - `CheckMissingInformation`
  - `LoadGoogleCalendar`
  - `LoadTeamSchedule`
  - `CalculateVacationScore`
  - `GenerateNegotiationPlan`
  - `GenerateSlackMessage`
  - `WaitForUserReview`
  - `PostToSlack`
  - `UpdateStatus`
  - `ErrorHandler`
- The workflow shall support human-in-the-loop pauses for review before Slack posting.

### FR-10 Adapter Separation
- Slack and calendar integrations shall be implemented behind adapter interfaces so they can later be replaced with MCP-backed implementations.
- The system shall support demo-mode adapters and real adapters without changing core orchestration logic.

## Data Requirements
- The system shall manage at least the following entities:
  - `ChatSessions`
  - `ChatMessages`
  - `VacationRequests`
  - `TeamSchedules`
  - `Users`
- The MVP data model shall include all fields listed in the original specification unless a later design stage refines names or storage layout.
- The system shall persist workflow state and generated artifacts needed for request detail and demo traceability.

## UI Requirements
- The system shall provide the following screens/panels:
  - `Chat`
  - `Analysis Result Panel`
  - `Slack Message Review`
  - `Request Detail`
- The chat screen shall show conversation history, input, summary cards, candidate dates, Slack review entry, and current status.
- The analysis panel shall show leave mode, business impact, affected meetings, substitute candidates, reasoning, and negotiation strategy.
- The Slack review view shall show preview, mentions, channel, editable message body, send action, and cancel action.
- The request detail view shall show request data, chat history, analysis, status, and Slack posting history.

## Architecture Requirements
- The frontend shall use React, TypeScript, Vite, and Tailwind CSS.
- Hosting shall target AWS Amplify Hosting.
- The API layer shall use Amazon API Gateway.
- The backend shall be implemented in TypeScript and centered on Bedrock AgentCore Runtime for agent behavior.
- Workflow orchestration shall use AWS Step Functions.
- Persistence shall use DynamoDB.
- AI generation shall use Amazon Bedrock.
- Secrets shall be stored in AWS Secrets Manager.
- Logs and execution traces shall be visible in CloudWatch.
- Slack integration shall use Slack Incoming Webhook or Slack Web API, with the implementation chosen later for best thread and mention support.
- Google Calendar API credentials shall be managed via AWS Secrets Manager.

## Multi-Agent Requirements
- The application shall use an orchestrator plus sub-agent structure.
- The orchestrator shall decide when to invoke specialized sub-agents.
- The MVP shall include at least one working escalation path to a lawyer-style sub-agent for difficult `絶対休めるモード` negotiations.
- Sub-agent behavior may be implemented with lightweight prompt/persona specialization as long as the orchestration boundary is explicit.

## Non-Functional Requirements

### NFR-01 Demo Reliability
- The demo shall complete end-to-end using only demo data if external integrations fail.
- Bedrock generation failures shall fall back to template-based message generation.
- Google Calendar failures shall fall back to demo schedule data.
- Slack failures shall surface clear UI errors and preserve generated content for retry.

### NFR-02 Observability
- Workflow state transitions and failures shall be observable in Step Functions and/or CloudWatch.
- The system shall log enough detail to explain score calculation inputs, workflow branch decisions, and posting outcomes during demo troubleshooting.

### NFR-03 Extensibility
- The architecture shall isolate domain workflow logic from external integration adapters.
- The architecture shall allow future expansion into other "difficult communication delegation" workflows.
- The leave mode mechanism shall be designed so future modes can be added without redesigning the chat foundation.

### NFR-04 Usability
- The user shall be able to drive the MVP with natural language and minimal form filling.
- The UI shall prioritize a fast, understandable demo flow over enterprise completeness.
- The generated Japanese messaging shall feel natural and non-confrontational.

### NFR-05 Safety and Compliance
- The system shall not generate fraudulent or deceptive leave reasons.
- The `バレずに休みたいモード` shall be implemented as "minimize operational impact and phrase naturally," not as concealment support.
- The system shall keep user-edit review before any Slack posting.

### NFR-06 Testing Strategy
- Property-based testing is a required constraint in later applicable stages.
- The project shall select a TypeScript-compatible PBT framework and include it in the testing strategy.
- Business-critical behavior shall still require example-based tests in addition to property-based tests.

## Assumptions
- A Slack workspace and posting credential will be available for the demo.
- Google Calendar API access for at least one demo user will be obtainable, even if fallback data is also prepared.
- Hackathon scope permits demo-focused auth omission.
- Team schedule data can be seeded and maintained in the app or static fixtures for demo resilience.

## Constraints
- The solution must remain AWS-native in its primary deployment architecture.
- The MVP must focus only on paid leave coordination.
- The solution must separate adapters for future MCP replacement.
- The workflow must preserve human review before outbound Slack posting.

## Risks and Open Items
- Actual Slack thread creation requirements may push the implementation toward Slack Web API rather than a simple webhook.
- Bedrock AgentCore runtime integration details may affect local development ergonomics and deployment packaging.
- Real Google Calendar integration may require consent and credential setup that must be validated early.
- No authentication increases demo speed but reduces realism for user identity and personalization.

## Recommended Next Stage
- **User Stories** should execute next because this is a user-facing, multi-persona, multi-step workflow with significant acceptance-criteria needs.

## Extension Compliance Summary

### Security Baseline
- **Status**: Disabled by user choice in Requirements Analysis

### Property-Based Testing
- **Status**: Enabled
- **Requirements Analysis applicability**: N/A
- **Rationale**: PBT rules begin applying in Functional Design, NFR Requirements, Code Generation, and Build and Test stages, not in Requirements Analysis artifacts.
