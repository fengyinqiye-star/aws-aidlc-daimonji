# Infrastructure and Operational Support NFR Design Plan

## Progress Checklist
- [x] Review NFR requirements and tech-stack decisions
- [x] Identify non-functional design pattern decision points
- [x] Draft NFR design clarification questions
- [x] Collect user answers for the NFR design questions
- [x] Generate `nfr-design-patterns.md`
- [x] Generate `logical-components.md`

## Unit Summary
- Unit name: `Infrastructure and Operational Support`
- Scope: workflow-level resilience, concurrency handling, latency-sensitive state updates, auditability, and operational notification design
- Design focus: retry/backoff patterns, failure-routing patterns, request-state consistency, logging/notification component boundaries, and infrastructure-facing logical components

## Question 1
一時障害に対する再試行パターンとして、MVP で優先すべきものはどれですか。

A) Step Functions 標準の Retry/Backoff を中心に使い、Lambda 側は極力シンプルにする  
B) Lambda 側でも再試行制御を持ち、Step Functions と二段で吸収する  
C) 再試行は最小限にして、失敗通知を早く返すことを優先する  
D) 処理ごとに方式を分け、後続で個別最適化する  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
`FATAL` 障害時の UI 表示と運用通知の関係は、どの設計を優先しますか。

A) UI 表示と Slack 通知を同じ障害イベントから派生させ、一貫性を重視する  
B) UI 表示を優先し、Slack 通知はベストエフォートにする  
C) Slack 通知を優先し、UI 表示は簡易でもよい  
D) 障害種別ごとに UI と通知の出し分けを細かく制御したい  
E) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 3
Request 状態の整合性確保について、MVP で採るべき考え方はどれですか。

A) Request の現在状態を単一レコードで管理し、イベントログは補助的に使う  
B) イベントログを正とし、現在状態は再構築可能にする  
C) 現在状態とイベントログの両方を同格で更新するが、現在状態を参照の主軸にする  
D) 実装簡易性を優先し、最小限の状態のみ保持する  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
高重要度障害の Slack 通知方式として、どの設計粒度を想定しますか。

A) ワークフロー単位で 1 通に集約し、重複通知を避ける  
B) 障害イベントごとに即時通知し、見逃し防止を優先する  
C) 同一 Request 内では集約し、Request をまたぐ重複は許容する  
D) MVP では通知頻度より実装容易性を優先する  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
API Gateway を置く場合の設計前提として、この Unit ではどの考え方を採るべきですか。

A) フロント向け公開入口としてのみ扱い、内部コンポーネント間通信には使わない  
B) 一部の内部処理呼び出しにも API Gateway を経由させたい  
C) この Unit ではまだ API Gateway の有無を決めず、論理境界だけ定義したい  
D) MVP では API Gateway を使わず、別入口を前提にしたい  
E) Other (please describe after [Answer]: tag below)

[Answer]:A
