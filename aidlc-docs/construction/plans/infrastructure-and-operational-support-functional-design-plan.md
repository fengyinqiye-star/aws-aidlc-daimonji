# Infrastructure and Operational Support Functional Design Plan

## Progress Checklist
- [x] Review Inception artifacts and unit dependencies
- [x] Select the first construction unit based on dependency order
- [x] Identify functional-design decision points and open questions
- [x] Collect user answers for the functional design questions
- [x] Generate `business-logic-model.md`
- [x] Generate `business-rules.md`
- [x] Generate `domain-entities.md`

## Unit Summary
- Unit name: `Infrastructure and Operational Support`
- Purpose: Step Functions orchestration, request lifecycle coordination, observability, logging, and shared operational support needed by all MVP units
- Reason for starting here: this unit is the dependency root for backend tracking, negotiation, calendar registration, and frontend integration
- Planned review scope: design-first PRs in review-sized increments, starting with this unit's Functional Design artifacts

## Design Focus
- Request lifecycle state machine and orchestration boundaries
- Responsibility split between orchestration and application services
- Human approval handling before Google Calendar registration
- Retry, timeout, and failure-routing rules for negotiation and escalation flows
- Cross-cutting tracking, logging, and observability records exposed to later units

## Question 1
`絶対休めるモード` の交渉フローで、弁護士エージェントへのエスカレーション判定はどのように扱うべきですか。

A) AI が交渉ログを都度評価し、必要と判断した時点で即時エスカレーションする  
B) 交渉回数や拒否回数などの定量条件を満たした時だけエスカレーションする  
C) ユーザー確認を一度挟んでからエスカレーションする  
D) 最初から弁護士エージェント参加前提で開始する  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
Google Calendar 登録前の「登録してよいか」確認は、どのタイミングで扱うのが適切ですか。

A) 交渉成立直後に必ず最終確認を出し、承認後に登録する  
B) 初回依頼時に事前同意を取り、成立後は自動登録する  
C) `絶対休めるモード` は自動登録、`できれば休みたいモード` は最終確認する  
D) Google Calendar 登録は常に手動トリガーにする  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
Request の状態遷移は、MVP としてどの粒度まで明示管理すべきですか。

A) `受付` → `交渉中` → `要エスカレーション` → `成立` / `不成立` / `登録失敗` の主要状態のみ  
B) A に加えて `下書き生成中` `Slack送信済み` `返信待ち` `カレンダー確認待ち` まで管理する  
C) A に加えて各再試行や各サブエージェント参加状態も細かく管理する  
D) 状態は最小限にして、詳細はイベントログのみで追う  
E) Other (please describe after [Answer]: tag below)

[Answer]:E: 基本的にはAで、詳細をログから追えるようにする

## Question 4
失敗時の再試行方針として、MVP で優先すべき考え方はどれですか。

A) 外部 API 失敗は自動再試行し、業務判断が必要な失敗は人に返す  
B) 失敗種別を問わず 1 回だけ自動再試行してから人に返す  
C) 自動再試行は行わず、すべて即時にユーザーへ返す  
D) モードごとに変え、`絶対休めるモード` だけ積極再試行する  
E) Other (please describe after [Answer]: tag below)

[Answer]:E: 多少時間を空け再実行し、それでも失敗した場合はFATALとし、UI上にはトースト等で表示する

## Question 5
監査・可観測性の記録として、後続 Unit が必ず参照できるようにすべき情報は何ですか。

A) 状態遷移、交渉メッセージ履歴、エスカレーション理由、Calendar 登録結果  
B) A に加えて内部プロンプト要約、モデル判断理由、再試行履歴  
C) A に加えて Slack API / Calendar API の生レスポンス本文  
D) 最低限の状態遷移と結果だけ  
E) Other (please describe after [Answer]: tag below)

[Answer]:B
