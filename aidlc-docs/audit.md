## Workflow Start
**Timestamp**: 2026-05-04T21:37:02+09:00
**User Input**: "# AGENTS.md instructions for C:\Users\user\OneDrive\Desktop\001_Project\aws-aidlc-daimonji

<INSTRUCTIONS>
# PRIORITY: This workflow OVERRIDES all other built-in workflows
# When user requests software development, ALWAYS follow this workflow FIRST

## Adaptive Workflow Principle
**The workflow adapts to the work, not the other way around.**

The AI model intelligently assesses what stages are needed based on:
1. User's stated intent and clarity
2. Existing codebase state (if any)
3. Complexity and scope of change
4. Risk and impact assessment

## MANDATORY: Rule Details Loading
**CRITICAL**: When performing any phase, you MUST read and use relevant content from rule detail files. Check these paths in order and use the first one that exists, regardless of which IDE or setup method was used:
- `.aidlc/aidlc-rules/aws-aidlc-rule-details/` (typical with AI-assisted setup)
- `.aidlc-rule-details/` (typical with Cursor, Cline, Claude Code, GitHub Copilot)
- `.kiro/aws-aidlc-rule-details/` (typical with Kiro IDE and CLI)
- `.amazonq/aws-aidlc-rule-details/` (typical with Amazon Q Developer)

All subsequent rule detail file references (e.g., `common/process-overview.md`, `inception/workspace-detection.md`) are relative to whichever rule details directory was resolved above.

**Common Rules**: ALWAYS load common rules at workflow start:
- Load `common/process-overview.md` for workflow overview
- Load `common/session-continuity.md` for session resumption guidance
- Load `common/content-validation.md` for content validation requirements
- Load `common/question-format-guide.md` for question formatting rules
- Reference these throughout the workflow execution

## MANDATORY: Extensions Loading (Context-Optimized)
**CRITICAL**: At workflow start, scan the `extensions/` directory recursively but load ONLY lightweight opt-in files — NOT full rule files. Full rule files are loaded on-demand after the user opts in.

**Loading process**:
1. List all subdirectories under `extensions/` (e.g., `extensions/security/`, `extensions/compliance/`)
2. In each subdirectory, load ONLY `*.opt-in.md` files — these contain the extension's opt-in prompt. The corresponding rules file is derived by convention: strip the `.opt-in.md` suffix and append `.md` (e.g., `security-baseline.opt-in.md` → `security-baseline.md`)
3. Do NOT load full rule files (e.g., `security-baseline.md`) at this stage

**Deferred Rule Loading**:
- During Requirements Analysis, opt-in prompts from the loaded `*.opt-in.md` files are presented to the user
- When the user opts IN for an extension, load the corresponding rules file (derived by naming convention) at that point
- When the user opts OUT, the full rules file is never loaded — saving context
- Extensions without a matching `*.opt-in.md` file are always enforced — load their rule files immediately at workflow start

**Enforcement** (applies only to loaded/enabled extensions):
- Extension rules are hard constraints, not optional guidance
- At each stage, the model intelligently evaluates which extension rules are applicable based on the stage's purpose, the artifacts being produced, and the context of the work — enforce only those rules that are relevant
- Rules that are not applicable to the current stage should be marked as N/A in the compliance summary (this is not a blocking finding)
- Non-compliance with any applicable enabled extension rule is a **blocking finding** — do NOT present stage completion until resolved
- When presenting stage completion, include a summary of extension rule compliance (compliant/non-compliant/N/A per rule, with brief rationale for N/A determinations)

**Conditional Enforcement**: Extensions may be conditionally enabled/disabled. See `inception/requirements-analysis.md` for the opt-in mechanism. Before enforcing any extension at ANY stage, check its `Enabled` status in `aidlc-docs/aidlc-state.md` under `## Extension Configuration`. Skip disabled extensions and log the skip in audit.md. Default to enforced if no configuration exists. 

## MANDATORY: Content Validation
**CRITICAL**: Before creating ANY file, you MUST validate content according to `common/content-validation.md` rules:
- Validate Mermaid diagram syntax
- Validate ASCII art diagrams (see `common/ascii-diagram-standards.md`)
- Escape special characters properly
- Provide text alternatives for complex visual content
- Test content parsing compatibility

## MANDATORY: Question File Format
**CRITICAL**: When asking questions at any phase, you MUST follow question format guidelines.

**See `common/question-format-guide.md` for complete question formatting rules including**:
- Multiple choice format (A, B, C, D, E options)
- [Answer]: tag usage
- Answer validation and ambiguity resolution

## MANDATORY: Custom Welcome Message
**CRITICAL**: When starting ANY software development request, you MUST display the welcome message.

**How to Display Welcome Message**:
1. Load the welcome message from `common/welcome-message.md` (in the resolved rule details directory)
2. Display the complete message to the user
3. This should only be done ONCE at the start of a new workflow
4. Do NOT load this file in subsequent interactions to save context space

# Adaptive Software Development Workflow

---

# INCEPTION PHASE

**Purpose**: Planning, requirements gathering, and architectural decisions

**Focus**: Determine WHAT to build and WHY

**Stages in INCEPTION PHASE**:
- Workspace Detection (ALWAYS)
- Reverse Engineering (CONDITIONAL - Brownfield only)
- Requirements Analysis (ALWAYS - Adaptive depth)
- User Stories (CONDITIONAL)
- Workflow Planning (ALWAYS)
- Application Design (CONDITIONAL)
- Units Generation (CONDITIONAL)

---

## Workspace Detection (ALWAYS EXECUTE)

1. **MANDATORY**: Log initial user request in audit.md with complete raw input
2. Load all steps from `inception/workspace-detection.md`
3. Execute workspace detection:
   - Check for existing aidlc-state.md (resume if found)
   - Scan workspace for existing code
   - Determine if brownfield or greenfield
   - Check for existing reverse engineering artifacts
4. Determine next phase: Reverse Engineering (if brownfield and no artifacts) OR Requirements Analysis
5. **MANDATORY**: Log findings in audit.md
6. Present completion message to user (see workspace-detection.md for message formats)
7. Automatically proceed to next phase

## Reverse Engineering (CONDITIONAL - Brownfield Only)

**Execute IF**:
- Existing codebase detected
- No previous reverse engineering artifacts found

**Skip IF**:
- Greenfield project
- Previous reverse engineering artifacts exist

**Execution**:
1. **MANDATORY**: Log start of reverse engineering in audit.md
2. Load all steps from `inception/reverse-engineering.md`
3. Execute reverse engineering:
   - Analyze all packages and components
   - Generate a business overview of the whole system covering the business transactions
   - Generate architecture documentation
   - Generate code structure documentation
   - Generate API documentation
   - Generate component inventory
   - Generate Interaction Diagrams depicting how business transactions are implemented across components
   - Generate technology stack documentation
   - Generate dependencies documentation

4. **Wait for Explicit Approval**: Present detailed completion message (see reverse-engineering.md for message format) - DO NOT PROCEED until user confirms
5. **MANDATORY**: Log user's response in audit.md with complete raw input

## Requirements Analysis (ALWAYS EXECUTE - Adaptive Depth)

**Always executes** but depth varies based on request clarity and complexity:
- **Minimal**: Simple, clear request - just document intent analysis
- **Standard**: Normal complexity - gather functional and non-functional requirements
- **Comprehensive**: Complex, high-risk - detailed requirements with traceability

**Execution**:
1. **MANDATORY**: Log any user input during this phase in audit.md
2. Load all steps from `inception/requirements-analysis.md`
3. Execute requirements analysis:
   - Load reverse engineering artifacts (if brownfield)
   - Analyze user request (intent analysis)
   - Determine requirements depth needed
   - Assess current requirements
   - Ask clarifying questions (if needed)
   - Generate requirements document
4. Execute at appropriate depth (minimal/standard/comprehensive)
5. **Wait for Explicit Approval**: Follow approval format from requirements-analysis.md detailed steps - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

## User Stories (CONDITIONAL)

**INTELLIGENT ASSESSMENT**: Use multi-factor analysis to determine if user stories add value:

**ALWAYS Execute IF** (High Priority Indicators):
- New user-facing features or functionality
- Changes affecting user workflows or interactions
- Multiple user types or personas involved
- Complex business requirements with acceptance criteria needs
- Cross-functional team collaboration required
- Customer-facing API or service changes
- New product capabilities or enhancements

**LIKELY Execute IF** (Medium Priority - Assess Complexity):
- Modifications to existing user-facing features
- Backend changes that indirectly affect user experience
- Integration work that impacts user workflows
- Performance improvements with user-visible benefits
- Security enhancements affecting user interactions
- Data model changes affecting user data or reports

**COMPLEXITY-BASED ASSESSMENT**: For medium priority cases, execute user stories if:
- Request involves multiple components or services
- Changes span multiple user touchpoints
- Business logic is complex or has multiple scenarios
- Requirements have ambiguity that stories could clarify
- Implementation affects multiple user journeys
- Change has significant business impact or risk

**SKIP ONLY IF** (Low Priority - Simple Cases):
- Pure internal refactoring with zero user impact
- Simple bug fixes with clear, isolated scope
- Infrastructure changes with no user-facing effects
- Technical debt cleanup with no functional changes
- Developer tooling or build process improvements
- Documentation-only updates

**ASSESSMENT CRITERIA**: When in doubt, favor inclusion of user stories for:
- Requests with business stakeholder involvement
- Changes requiring user acceptance testing
- Features with multiple implementation approaches
- Work that benefits from shared team understanding
- Projects where requirements clarity is valuable

**ASSESSMENT PROCESS**: 
1. Analyze request complexity and scope
2. Identify user impact (direct or indirect)
3. Evaluate business context and stakeholder needs
4. Consider team collaboration benefits
5. Default to inclusion for borderline cases

**Note**: If Requirements Analysis executed, Stories can reference and build upon those requirements.

**User Stories has two parts within one stage**:
1. **Part 1 - Planning**: Create story plan with questions, collect answers, analyze for ambiguities, get approval
2. **Part 2 - Generation**: Execute approved plan to generate stories and personas

**Execution**:
1. **MANDATORY**: Log any user input during this phase in audit.md
2. Load all steps from `inception/user-stories.md`
3. **MANDATORY**: Perform intelligent assessment (Step 1 in user-stories.md) to validate user stories are needed
4. Load reverse engineering artifacts (if brownfield)
5. If Requirements exist, reference them when creating stories
6. Execute at appropriate depth (minimal/standard/comprehensive)
7. **PART 1 - Planning**: Create story plan with questions, wait for user answers, analyze for ambiguities, get approval
8. **PART 2 - Generation**: Execute approved plan to generate stories and personas
9. **Wait for Explicit Approval**: Follow approval format from user-stories.md detailed steps - DO NOT PROCEED until user confirms
10. **MANDATORY**: Log user's response in audit.md with complete raw input

## Workflow Planning (ALWAYS EXECUTE)

1. **MANDATORY**: Log any user input during this phase in audit.md
2. Load all steps from `inception/workflow-planning.md`
3. **MANDATORY**: Load content validation rules from `common/content-validation.md`
4. Load all prior context:
   - Reverse engineering artifacts (if brownfield)
   - Intent analysis
   - Requirements (if executed)
   - User stories (if executed)
5. Execute workflow planning:
   - Determine which phases to execute
   - Determine depth level for each phase
   - Create multi-package change sequence (if brownfield)
   - Generate workflow visualization (VALIDATE Mermaid syntax before writing)
6. **MANDATORY**: Validate all content before file creation per content-validation.md rules
7. **Wait for Explicit Approval**: Present recommendations using language from workflow-planning.md Step 9, emphasizing user control to override recommendations - DO NOT PROCEED until user confirms
8. **MANDATORY**: Log user's response in audit.md with complete raw input

## Application Design (CONDITIONAL)

**Execute IF**:
- New components or services needed
- Component methods and business rules need definition
- Service layer design required
- Component dependencies need clarification

**Skip IF**:
- Changes within existing component boundaries
- No new components or methods
- Pure implementation changes

**Execution**:
1. **MANDATORY**: Log any user input during this phase in audit.md
2. Load all steps from `inception/application-design.md`
3. Load reverse engineering artifacts (if brownfield)
4. Execute at appropriate depth (minimal/standard/comprehensive)
5. **Wait for Explicit Approval**: Present detailed completion message (see application-design.md for message format) - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

## Units Generation (CONDITIONAL)

**Execute IF**:
- System needs decomposition into multiple units of work
- Multiple services or modules required
- Complex system requiring structured breakdown

**Skip IF**:
- Single simple unit
- No decomposition needed
- Straightforward single-component implementation

**Execution**:
1. **MANDATORY**: Log any user input during this phase in audit.md
2. Load all steps from `inception/units-generation.md`
3. Load reverse engineering artifacts (if brownfield)
4. Execute at appropriate depth (minimal/standard/comprehensive)
5. **Wait for Explicit Approval**: Present detailed completion message (see units-generation.md for message format) - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

---

# 🟢 CONSTRUCTION PHASE

**Purpose**: Detailed design, NFR implementation, and code generation

**Focus**: Determine HOW to build it

**Stages in CONSTRUCTION PHASE**:
- Per-Unit Loop (executes for each unit):
  - Functional Design (CONDITIONAL, per-unit)
  - NFR Requirements (CONDITIONAL, per-unit)
  - NFR Design (CONDITIONAL, per-unit)
  - Infrastructure Design (CONDITIONAL, per-unit)
  - Code Generation (ALWAYS, per-unit)
- Build and Test (ALWAYS - after all units complete)

**Note**: Each unit is completed fully (design + code) before moving to the next unit.

---

## Per-Unit Loop (Executes for Each Unit)

**For each unit of work, execute the following stages in sequence:**

### Functional Design (CONDITIONAL, per-unit)

**Execute IF**:
- New data models or schemas
- Complex business logic
- Business rules need detailed design

**Skip IF**:
- Simple logic changes
- No new business logic

**Execution**:
1. **MANDATORY**: Log any user input during this stage in audit.md
2. Load all steps from `construction/functional-design.md`
3. Execute functional design for this unit
4. **MANDATORY**: Present standardized 2-option completion message as defined in functional-design.md - DO NOT use emergent 3-option behavior
5. **Wait for Explicit Approval**: User must choose between "Request Changes" or "Continue to Next Stage" - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

### NFR Requirements (CONDITIONAL, per-unit)

**Execute IF**:
- Performance requirements exist
- Security considerations needed
- Scalability concerns present
- Tech stack selection required

**Skip IF**:
- No NFR requirements
- Tech stack already determined

**Execution**:
1. **MANDATORY**: Log any user input during this stage in audit.md
2. Load all steps from `construction/nfr-requirements.md`
3. Execute NFR assessment for this unit
4. **MANDATORY**: Present standardized 2-option completion message as defined in nfr-requirements.md - DO NOT use emergent behavior
5. **Wait for Explicit Approval**: User must choose between "Request Changes" or "Continue to Next Stage" - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

### NFR Design (CONDITIONAL, per-unit)

**Execute IF**:
- NFR Requirements was executed
- NFR patterns need to be incorporated

**Skip IF**:
- No NFR requirements
- NFR Requirements was skipped

**Execution**:
1. **MANDATORY**: Log any user input during this stage in audit.md
2. Load all steps from `construction/nfr-design.md`
3. Execute NFR design for this unit
4. **MANDATORY**: Present standardized 2-option completion message as defined in nfr-design.md - DO NOT use emergent behavior
5. **Wait for Explicit Approval**: User must choose between "Request Changes" or "Continue to Next Stage" - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

### Infrastructure Design (CONDITIONAL, per-unit)

**Execute IF**:
- Infrastructure services need mapping
- Deployment architecture required
- Cloud resources need specification

**Skip IF**:
- No infrastructure changes
- Infrastructure already defined

**Execution**:
1. **MANDATORY**: Log any user input during this stage in audit.md
2. Load all steps from `construction/infrastructure-design.md`
3. Execute infrastructure design for this unit
4. **MANDATORY**: Present standardized 2-option completion message as defined in infrastructure-design.md - DO NOT use emergent behavior
5. **Wait for Explicit Approval**: User must choose between "Request Changes" or "Continue to Next Stage" - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

### Code Generation (ALWAYS EXECUTE, per-unit)

**Always executes for each unit**

**Code Generation has two parts within one stage**:
1. **Part 1 - Planning**: Create detailed code generation plan with explicit steps
2. **Part 2 - Generation**: Execute approved plan to generate code, tests, and artifacts

**Execution**:
1. **MANDATORY**: Log any user input during this stage in audit.md
2. Load all steps from `construction/code-generation.md`
3. **PART 1 - Planning**: Create code generation plan with checkboxes, get user approval
4. **PART 2 - Generation**: Execute approved plan to generate code for this unit
5. **MANDATORY**: Present standardized 2-option completion message as defined in code-generation.md - DO NOT use emergent behavior
6. **Wait for Explicit Approval**: User must choose between "Request Changes" or "Continue to Next Stage" - DO NOT PROCEED until user confirms
7. **MANDATORY**: Log user's response in audit.md with complete raw input

---

## Build and Test (ALWAYS EXECUTE)

1. **MANDATORY**: Log any user input during this phase in audit.md
2. Load all steps from `construction/build-and-test.md`
3. Generate comprehensive build and test instructions:
   - Build instructions for all units
   - Unit test execution instructions
   - Integration test instructions (test interactions between units)
   - Performance test instructions (if applicable)
   - Additional test instructions as needed (contract tests, security tests, e2e tests)
4. Create instruction files in build-and-test/ subdirectory: build-instructions.md, unit-test-instructions.md, integration-test-instructions.md, performance-test-instructions.md, build-and-test-summary.md
5. **Wait for Explicit Approval**: Ask: \"**Build and test instructions complete. Ready to proceed to Operations stage?**\" - DO NOT PROCEED until user confirms
6. **MANDATORY**: Log user's response in audit.md with complete raw input

---

# 🟡 OPERATIONS PHASE

**Purpose**: Placeholder for future deployment and monitoring workflows

**Focus**: How to DEPLOY and RUN it (future expansion)

**Stages in OPERATIONS PHASE**:
- Operations (PLACEHOLDER)

---

## Operations (PLACEHOLDER)

**Status**: This stage is currently a placeholder for future expansion.

The Operations stage will eventually include:
- Deployment planning and execution
- Monitoring and observability setup
- Incident response procedures
- Maintenance and support workflows
- Production readiness checklists

**Current State**: All build and test activities are handled in the CONSTRUCTION phase.

## Key Principles

- **Adaptive Execution**: Only execute stages that add value
- **Transparent Planning**: Always show execution plan before starting
- **User Control**: User can request stage inclusion/exclusion
- **Progress Tracking**: Update aidlc-state.md with executed and skipped stages
- **Complete Audit Trail**: Log ALL user inputs and AI responses in audit.md with timestamps
  - **CRITICAL**: Capture user's COMPLETE RAW INPUT exactly as provided
  - **CRITICAL**: Never summarize or paraphrase user input in audit log
  - **CRITICAL**: Log every interaction, not just approvals
- **Quality Focus**: Complex changes get full treatment, simple changes stay efficient
- **Content Validation**: Always validate content before file creation per content-validation.md rules
- **NO EMERGENT BEHAVIOR**: Construction phases MUST use standardized 2-option completion messages as defined in their respective rule files. DO NOT create 3-option menus or other emergent navigation patterns.

## MANDATORY: Plan-Level Checkbox Enforcement

### MANDATORY RULES FOR PLAN EXECUTION
1. **NEVER complete any work without updating plan checkboxes**
2. **IMMEDIATELY after completing ANY step described in a plan file, mark that step [x]**
3. **This must happen in the SAME interaction where the work is completed**
4. **NO EXCEPTIONS**: Every plan step completion MUST be tracked with checkbox updates

### Two-Level Checkbox Tracking System
- **Plan-Level**: Track detailed execution progress within each stage
- **Stage-Level**: Track overall workflow progress in aidlc-state.md
- **Update immediately**: All progress updates in SAME interaction where work is completed

## Prompts Logging Requirements
- **MANDATORY**: Log EVERY user input (prompts, questions, responses) with timestamp in audit.md
- **MANDATORY**: Capture user's COMPLETE RAW INPUT exactly as provided (never summarize)
- **MANDATORY**: Log every approval prompt with timestamp before asking the user
- **MANDATORY**: Record every user response with timestamp after receiving it
- **CRITICAL**: ALWAYS append changes to EDIT audit.md file, NEVER use tools and commands that completely overwrite its contents
- **CRITICAL**: NEVER use file writing tools and commands that overwrite the entire contents of audit.md, as this causes duplication
- Use ISO 8601 format for timestamps (YYYY-MM-DDTHH:MM:SSZ)
- Include stage context for each entry

### Audit Log Format:
```markdown
## [Stage Name or Interaction Type]
**Timestamp**: [ISO timestamp]
**User Input**: \"[Complete raw user input - never summarized]\"
**AI Response**: \"[AI's response or action taken]\"
**Context**: [Stage, action, or decision made]

---
```

### Correct Tool Usage for audit.md

✅ CORRECT:

1. Read the audit.md file
2. Append/Edit the file to make changes

❌ WRONG:

1. Read the audit.md file
2. Completely overwrite the audit.md with the contents of what you read, plus the new changes you want to add to it

## Directory Structure

```text
<WORKSPACE-ROOT>/                   # ⚠️ APPLICATION CODE HERE
├── [project-specific structure]    # Varies by project (see code-generation.md)
│
├── aidlc-docs/                     # 📄 DOCUMENTATION ONLY
│   ├── inception/                  # 🔵 INCEPTION PHASE
│   │   ├── plans/
│   │   ├── reverse-engineering/    # Brownfield only
│   │   ├── requirements/
│   │   ├── user-stories/
│   │   └── application-design/
│   ├── construction/               # 🟢 CONSTRUCTION PHASE
│   │   ├── plans/
│   │   ├── {unit-name}/
│   │   │   ├── functional-design/
│   │   │   ├── nfr-requirements/
│   │   │   ├── nfr-design/
│   │   │   ├── infrastructure-design/
│   │   │   └── code/               # Markdown summaries only
│   │   └── build-and-test/
│   ├── operations/                 # 🟡 OPERATIONS PHASE (placeholder)
│   ├── aidlc-state.md
│   └── audit.md
```

**CRITICAL RULE**:
- Application code: Workspace root (NEVER in aidlc-docs/)
- Documentation: aidlc-docs/ only
- Project structure: See code-generation.md for patterns by project type

</INSTRUCTIONS><environment_context>
  <cwd>C:\Users\user\OneDrive\Desktop\001_Project\aws-aidlc-daimonji</cwd>
  <shell>powershell</shell>
  <current_date>2026-05-04</current_date>
  <timezone>Asia/Tokyo</timezone>
</environment_context>"
**AI Response**: "Loaded AI-DLC common rules, resolved rule directory to `.aidlc-rule-details/`, scanned extensions for opt-in prompts, and started Workspace Detection."
**Context**: Workflow bootstrap and mandatory initial logging

---

## Requirements Request
**Timestamp**: 2026-05-04T21:37:02+09:00
**User Input**: "作業ディレクトリは以下です。

C:\Users\user\OneDrive\Desktop\001_Project\aws-aidlc-daimonji

---

# Spec Prompt: 「AIが決めたんで。」有休調整AI MVP

AWSハッカソン向けに、「人をだめにするサービス」をテーマとしたWebアプリを作成します。

サービス名は「AIが決めたんで。」です。

MVPでは「有休調整」のみに絞ります。

ユーザーはチャット画面でAIに対して、自然文で「来週金曜休みたい」「できれば休みたい」「絶対休みたい」などと入力します。日付だけ入力された場合には休みたい温度感(絶対休みたいのか)をAIが質問してくるイメージです。

AIは会話の中で必要な情報を補完し、Outlookカレンダーの予定、チーム予定、会議、関係者、代替担当候補を分析して、休暇理由を検討します。

その後、AIはSlack投稿文を生成し、ユーザーがレビューしたうえで、Slack上に関係者メンション付きの調整スレッドを作成します。

本アプリは単なるSlack Botではなく、チャットを起点に有休調整ワークフローを実行するAIエージェント型Webアプリとして設計します。

---

## コンセプト

人間が言いにくい有休調整を、AIが代わりにやってくれるサービスです。

ユーザーはフォームを細かく入力する必要はありません。

チャットで以下のようにAIに依頼します。

- 来週金曜、できれば休みたい

- 5/10は絶対休みたい。いい感じに調整して。

- 今月どこかで自然に休めそうな日を探して。

AIは必要に応じて追加質問し、休暇希望日、休暇モード、休暇理由、関係者、Slack投稿先を整理します。

将来的には、有休調整だけでなく、会議欠席、催促、飲み会辞退、タスク調整など、人間が言いにくいこと全般をAIが代行するアプリへ拡張します。

---

## MVP機能

### チャット機能

- AIとのチャット画面

- 自然文による有休調整依頼

- AIによる不足情報の聞き返し

- AIによる休暇理由の生成

- AIによる休みやすい日の提案

- AIによる休暇モードの推定

- ユーザーによるモード明示指定

### 休暇モード

#### 絶対休めるモード

- 休む前提で代替案を提示する

- 関係者に具体的な依頼を出す

- 休暇取得を最優先する

- 強すぎる表現や命令口調は避ける

#### できれば休みたいモード

- 相談ベースで文面を生成する

- 休みづらい場合は別日候補も提示する

- 関係者への負荷が高い場合は無理に進めない

#### バレずに休みたいモード

- ネタ枠

- 実際には「業務影響を最小化して自然に休める日」を提案する

- 不正・虚偽の理由は生成しない

- Slack文面は通常の私用休暇として自然で角が立たない表現にする

### 有休分析機能

- Googleカレンダー連携

- デモ用チーム予定データ

- 業務影響度判定

- 影響を受ける会議の抽出

- 代替担当候補の表示

- 休みやすい日候補の提案

- AI判断理由の表示

### Slack連携

- AIによるSlack投稿文生成

- Slack投稿前レビュー

- Slack WebhookまたはSlack Web APIによる投稿

- Slack上で関係者メンション付きの調整スレッド作成

- Slack投稿成功後のステータス更新

### ステータス管理

- DRAFT

- COLLECTING_INFO

- ANALYZING

- REVIEW_REQUIRED

- NEGOTIATING

- APPROVED

- NEEDS_REPLAN

- FAILED



・マルチエージェント機能

絶対休みたいモードでネゴりがうまくいかなければ弁護士エージェントのようなSubAgentが出てくる。

構成としては、おーけすとれーたと各SubAgent構成とする。

---

## 非対象

- 将来的な飲み会断ったりのモード選択は、KiroのAIモデル選択のようなイメージで選択できることとする。(記載がなければチャットのやりとりでどのモードを使用するか確定する。)

- 勤怠システム連携

- 有休申請システム連携

- Slack返信の完全自動解析

- 本格的な認証認可(cognitoを検討)

- MCPサーバ本格実装

ただし、将来MCPに置き換えられるように、Slackやカレンダー連携部分はAdapter層として分離してください。

---

## AWS構成

すべてAWSで構築します。

- Frontend: React / TypeScript / Vite / Tailwind CSS

- Hosting: AWS Amplify Hosting

- API: Amazon API Gateway

- Backend: AWS Lambda または Bedrock AgentCore Runtime / TypeScript

- Workflow: AWS Step Functions

- DB: Amazon DynamoDB

- AI: Amazon Bedrock / Bedrock AgentCore

- Secret管理: AWS Secrets Manager

- Logs: Amazon CloudWatch

- Slack連携: Slack Incoming Webhook または Slack Web API

- Google Calendar連携: Google Calendar API

- Google認証情報管理: AWS Secrets Manager

---

## アプリ構成

本アプリはチャットをメインUIとします。

### メイン体験

ユーザー:

> 来週金曜、できれば休みたい

AI:

> 了解です。来週金曜の予定を確認します。

> 休暇理由は「私用のため」で自然な文面にしてよいですか？

ユーザー:

> はい

AI:

> 分析しました。

> 休暇実現可能性スコアは 76 / 100 です。

> 顧客定例がありますが、主担当ではなく、佐藤さんが一次対応可能です。

> Slack投稿文を作成しますか？

ユーザー:

> お願いします

AI:

> Slack投稿文を作成しました。送信前に確認してください。

### チャットから起動するワークフロー

- 休暇モードの抽出

- 不足情報の確認

- Googleカレンダー参照

- チーム予定参照

- 業務影響度判定

- ネゴ戦略生成

- Slack文面生成

- ユーザーレビュー

- Slack投稿

- ステータス更新

---

## 主要画面

### 1. Chat

メイン画面です。

表示内容:

- AIとの会話履歴

- ユーザー入力欄

- AIの分析サマリ

- 休暇候補日の提案

- スコア表示カード

- 業務影響カード

- Slack投稿文レビューへの導線

- 現在の調整ステータス

### 2. Analysis Result Panel

チャット画面の右側または下部に表示します。

表示内容:

- 休暇モード

- 業務影響度

- 影響を受ける予定

- 代替担当候補

- AIの判断理由

- 推奨ネゴ戦略

### 3. Slack Message Review

表示内容:

- Slack投稿文プレビュー

- メンション対象

- 投稿チャンネル

- 文面編集欄

- Slack送信ボタン

- キャンセルボタン

### 4. Request Detail

表示内容:

- 申請内容

- チャット履歴

- 分析結果

- 現在ステータス

- Slack投稿履歴

- ステータス更新ボタン

---

## 技術的な見せ場

単なるSlack Botではなく、「チャット起点のAI有休調整ワークフロー」として設計してください。

### 1. チャットによる情報抽出

ユーザーの自然文から以下を抽出します。

- 休暇希望日

- 休暇モード

- 休暇理由

- 緊急度

- Slack投稿先

- 関係者

不足している情報がある場合、AIがチャット上で聞き返します。

例:

- 「来週金曜休みたい」だけではモードが不明なため、AIが「絶対休みたいですか？できれば休みたいですか？」と確認する。

- 「今月どこかで休みたい」の場合、AIがGoogleカレンダーとチーム予定から休みやすい日を提案する。

### 2. 休みやすい日のAI提案

ユーザーが日付を明示しない場合、AIがGoogleカレンダーとチーム予定をもとに休みやすい日を提案します。

例:

- 5/13(水): スコア 88

- 5/15(金): スコア 76

- 5/12(火): スコア 62

### 3. 休暇実現可能性スコアリング

希望日について、0〜100で休みやすさを算出します。

考慮要素:

- 会議数

- 重要会議の有無

- 本人が主担当の予定

- 代替担当候補の有無

- 予定のリスケ可否

- チームメンバーの空き状況

- 休暇モード

- 休暇理由の緊急度

### 4. 業務影響度判定

Low / Medium / High の3段階で判定します。

判定理由も画面に表示してください。

例:

業務影響度: Medium

理由:

- 顧客定例がある

- ただし本人は主担当ではない

- 佐藤さんが代替対応可能

- 設計レビューはリスケ可能

### 5. モード別AI生成

休暇モードによってAIの文面と戦略を変えます。

#### 絶対休めるモード

- 休む前提で代替案を提示する

- 関係者に具体的な依頼を出す

- 強すぎる表現は避ける

#### できれば休みたいモード

- 相談ベースで文面を作る

- スコアが低い場合は別日候補も提示する

- 関係者への負荷が高い場合は無理に進めない

#### バレずに休みたいモード

- 不正な隠蔽や虚偽理由は生成しない

- 「自然に休める日」を優先提案する

- Slack文面は通常の私用休暇として自然な表現にする

### 6. Step Functionsによるワークフロー化

以下の処理をStep Functionsで管理してください。

- ReceiveChatMessage

- ExtractVacationIntent

- CheckMissingInformation

- LoadGoogleCalendar

- LoadTeamSchedule

- CalculateVacationScore

- GenerateNegotiationPlan

- GenerateSlackMessage

- WaitForUserReview

- PostToSlack

- UpdateStatus

- ErrorHandler

### 7. Slack調整スレッド

Slackには単なる通知ではなく、AIが関係者にメンションして調整スレッドを作成します。

投稿内容には以下を含めます。

- 休暇希望日

- 休暇モード

- 休暇実現可能性スコア

- 業務影響度

- AI判断理由

- 代替担当候補

- 関係者への依頼

- 「AIが決めたんで。」の一言

### 8. デモ耐性

ハッカソンデモで止まらないようにしてください。

- Bedrock失敗時はテンプレート文面にフォールバック

- Slack投稿失敗時は画面にエラー表示

- Slack送信をモック可能にする

- Google Calendar連携失敗時はデモデータにフォールバック

- デモデータだけで一連の流れを完結させる

---

## データモデル

### ChatSessions

- sessionId

- userId

- currentRequestId

- status

- createdAt

- updatedAt

### ChatMessages

- sessionId

- messageId

- sender

- content

- messageType

- createdAt

### VacationRequests

- requestId

- userId

- userName

- desiredDate

- reason

- mode

- score

- businessImpactLevel

- status

- affectedMeetings

- stakeholders

- substituteCandidates

- generatedMessage

- slackChannel

- slackThreadTs

- createdAt

- updatedAt

### TeamSchedules

- scheduleId

- teamId

- userId

- title

- startAt

- endAt

- importance

- participants

- canReschedule

### Users

- userId

- userName

- slackUserId

- teamId

- role

- googleCalendarId

---




---

## デモ成功条件

1. ユーザーがチャットで「来週金曜休みたい」と入力できる

2. AIが不足情報を聞き返せる

3. AIが休みやすい日を提案できる



5. 業務影響と代替担当候補が表示される

6. AIがSlack投稿文を生成する

7. ユーザーが文面をレビューできる

8. Slackに関係者メンション付きの調整スレッドを投稿できる

9. ステータスが「調整中」に変わる

10. Step FunctionsまたはCloudWatchで処理履歴を確認できる"
**AI Response**: "Classified the project request as a new greenfield AI agent web application for an AWS hackathon MVP and started requirements analysis preparation."
**Context**: Raw product specification intake

---

## Workspace Detection
**Timestamp**: 2026-05-04T21:37:02+09:00
**User Input**: ""
**AI Response**: "Completed workspace detection. Classified the workspace as a greenfield project with no existing application source code or build files. Created initial AI-DLC state and proceeded to Requirements Analysis."
**Context**: INCEPTION - Workspace Detection completion

---

## Requirements Analysis Prompt
**Timestamp**: 2026-05-04T21:37:02+09:00
**User Input**: ""
**AI Response**: "Created `aidlc-docs/inception/requirements/requirement-verification-questions.md` and requested the user to answer all `[Answer]:` fields before requirements generation."
**Context**: INCEPTION - Requirements Analysis question gate

---

## Requirements Answers
**Timestamp**: 2026-05-04T21:50:04+09:00
**User Input**: "[requirement-verification-questions.md](aidlc-docs/inception/requirements/requirement-verification-questions.md) を記載しましたので確認してください。"
**AI Response**: "Validated the completed answers, set Security Baseline to disabled, enabled Property-Based Testing, and proceeded to generate the requirements document."
**Context**: INCEPTION - Requirements Analysis answer intake

---

## Extension Enforcement
**Timestamp**: 2026-05-04T21:50:04+09:00
**User Input**: ""
**AI Response**: "Skipped Security Baseline enforcement because the user opted out. Loaded Property-Based Testing rules for future applicable stages."
**Context**: Requirements Analysis extension configuration

---

## Requirements Approval Prompt
**Timestamp**: 2026-05-04T21:50:04+09:00
**User Input**: ""
**AI Response**: "Requirements analysis complete. Requested review and approval of `aidlc-docs/inception/requirements/requirements.md` before proceeding to User Stories."
**Context**: INCEPTION - Requirements Analysis approval gate

---

## Requirements Document Translation
**Timestamp**: 2026-05-05T11:05:46+09:00
**User Input**: "[requirements.md](aidlc-docs/inception/requirements/requirements.md) を日本語で正本してPushしてください。"
**AI Response**: "Rewrote `aidlc-docs/inception/requirements/requirements.md` as the Japanese source-of-truth version while preserving the approved requirements scope and structure, then prepared the change for push."
**Context**: Documentation update on `docs/requirement`

---

## Requirements Approval and User Stories Request
**Timestamp**: 2026-05-06T22:10:02+09:00
**User Input**: "現在AI-DLCのInspectionフェーズです。 [requirements.md](aidlc-docs/inception/requirements/requirements.md) は作成済みです。
次のタスクはユーザストーリーの作成かと思うのでそちらを実施してください。"
**AI Response**: "Treated the request as approval to proceed beyond Requirements Analysis, resumed the workflow from the existing state, loaded the requirements artifacts and User Stories rules, and started User Stories planning."
**Context**: INCEPTION - Requirements approval by continuation request and User Stories stage start

---

## User Stories Planning Prompt
**Timestamp**: 2026-05-06T22:10:02+09:00
**User Input**: ""
**AI Response**: "Created `aidlc-docs/inception/plans/user-stories-assessment.md` and `aidlc-docs/inception/plans/story-generation-plan.md`, then requested the user to answer every `[Answer]:` field in the story generation plan and approve the plan before story generation begins."
**Context**: INCEPTION - User Stories planning approval gate

---

## Requirements Revision Request
**Timestamp**: 2026-05-06T22:21:33+09:00
**User Input**: "[requirements.md](aidlc-docs/inception/requirements/requirements.md) について、ビジネスゴールを編集しました。
内容としては本ＡＰＬは調整がメインなわけではなく、有休の交渉をしたいことがメインとなります。
有休についてカレンダー等を確認の上、ユーザに代わって交渉することがプロダクトビジョンです。
ビジネスゴールとしては、ユーザが絶対休みたいモードを利用した際には、交渉を行うことで必ず有休を取得できることです。
FR-05のスコアリングと業務影響判定については、休むための理由生成に使うものであってユーザからUIとして見える必要はないです。
その内容に沿って編集後の [requirements](aidlc-docs/inception/requirements) を確認し、再度校正してください。"
**AI Response**: "Reviewed the revised requirements, aligned the document around vacation negotiation rather than adjustment, clarified the product vision and business goal for `絶対休めるモード`, and updated FR-05 and the UI-related sections so scoring remains internal rather than a required visible UI element."
**Context**: INCEPTION - Requirements refinement during User Stories planning

---

## Requirements Mode and Calendar Update Request
**Timestamp**: 2026-05-06T22:32:17+09:00
**User Input**: "[requirements.md](aidlc-docs/inception/requirements/requirements.md) 
- バレずに休みたいモード: 削除してください。
- できれば休みたいモード: 有給取得ができなかった場合の想定挙動を教えてほしい。
    - ユーザに交渉相手とのやり取りについて素直なFBが返ってくることが想定動作であり、絶対休みたいモードのような挙動が行われないか懸念。
- 休暇交渉がうまくいった際には、Googleカレンダーへの休暇取得投入まで行うことを機能要件に追加してほしい。"
**AI Response**: "Removed `バレずに休みたいモード`, clarified that `できれば休みたいモード` returns honest negotiation feedback without escalation behavior like `絶対休めるモード`, and added a new functional requirement for Google Calendar leave registration after successful negotiation."
**Context**: INCEPTION - Requirements refinement during User Stories planning

---

## Requirements Escalation Logic Update Request
**Timestamp**: 2026-05-06T22:40:47+09:00
**User Input**: "[requirements.md](aidlc-docs/inception/requirements/requirements.md) 
- FR-03
    - 絶対休めるモード: 休暇取得成立が最優先なため、代替案の提示は不要となります。

- FR-06
    - 実現可能性について、システムが算出したスコアではなく、休暇交渉のやり取りから必要に応じて弁護士エージェントにエスカレを走らせてください。"
**AI Response**: "Updated `絶対休めるモード` to remove the requirement to present alternatives, and changed the lawyer-agent escalation trigger from score-based feasibility to the actual vacation negotiation exchange."
**Context**: INCEPTION - Requirements refinement during User Stories planning

---
