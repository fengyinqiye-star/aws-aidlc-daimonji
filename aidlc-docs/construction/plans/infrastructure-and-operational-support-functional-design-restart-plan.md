# Infrastructure and Operational Support Functional Design Restart Plan

## Progress Checklist
- [x] Review Inception requirements and application design artifacts
- [x] Review current infrastructure-support implementation and Terraform
- [x] Identify drift that forces Construction restart
- [x] Define restart objectives for the infrastructure unit
- [x] Collect restart clarification answers
- [x] Generate revised `business-logic-model.md`
- [x] Generate revised `business-rules.md`
- [x] Generate revised `domain-entities.md`

## Restart Context
- Unit name: `Infrastructure and Operational Support`
- Restart reason: the current implementation proves minimal deployability, but it does not satisfy the approved Inception scope for Bedrock-centered agent runtime, Amplify Hosting support, or meaningful Step Functions orchestration.
- Required delta from prior attempt:
  - Replace trivial Step Functions flow with explicit task-level orchestration.
  - Introduce Bedrock/agent runtime support into the active infrastructure design path.
  - Represent Amplify Hosting as part of the deployable MVP architecture.
  - Re-scope Lambda boundaries so orchestration failures are attributable to clear workflow steps.

## Restart Goals
- Redefine the workflow responsibilities for the infrastructure unit around the approved FR-09 logical steps.
- Clarify which orchestration tasks stay in Step Functions, which become task Lambdas, and where Bedrock agent execution lives.
- Preserve state tracking and observability while improving failure localization.
- Produce a design baseline that enables the remaining units to be built in the original dependency order.

## Question 1
Bedrock AgentCore Runtime を今回の MVP でどの範囲まで Infrastructure Unit に含めますか。

A) オーケストレータ用ランタイムと弁護士サブエージェント用ランタイムの両方を前提にする  
B) まず弁護士サブエージェント用ランタイムを優先し、オーケストレータは Step Functions + task Lambda で制御する  
C) Bedrock 呼び出し境界のみ先に確定し、AgentCore Runtime の実デプロイは Negotiation Unit と合わせて詰める  
X) Other (please describe after [Answer]: tag below)

[Answer]:A: Step Functions はワークフロー制御、交渉オーケストレータAgent は交渉判断・会話制御、弁護士Agent は専門的な法務観点の助言を担う構成とする。

## Question 2
Step Functions のタスク分解粒度はどれを基本にしますか。

A) `FR-09` の論理ステップに近い粒度で task を分割する  
B) `意図抽出/予定分析/交渉/登録` などの粗めの業務フェーズ単位で分割する  
C) まずは中間粒度で分割し、障害分析しやすい箇所だけ細かくする  
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
Amplify Hosting の扱いは Infrastructure Unit の再設計でどこまで含めますか。

A) Frontend Unit の実装前でも、Amplify Hosting のリソースと接続前提をこの Unit で先に定義する  
B) Frontend 実装に必要な環境変数と公開 API 境界だけ先に定義し、Amplify の詳細は Frontend Unit で詰める  
C) 今回の Unit では Amplify を参照要件に留め、実 IaC は Frontend Unit で持つ  
X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 4
Infrastructure Unit に残す Lambda の責務分割はどれを基本にしますか。

A) API entry Lambda と task Lambda を明確に分け、status/read 系も独立させる  
B) API entry は残しつつ、task は一部まとめて持つ  
C) Task Lambda は最小限にし、可能な限り Bedrock runtime 側へ寄せる  
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
Codex のフェーズ乖離監視オートメーションの初期運用として、どれを第一候補にしますか。

A) 毎日 1 回の cron 監視で十分  
B) 毎日 1 回に加えて main への merge 後も確認したい  
C) まずは毎日 1 回の提案だけ作り、実作成は設計が固まってからにしたい  
X) Other (please describe after [Answer]: tag below)

[Answer]:A
