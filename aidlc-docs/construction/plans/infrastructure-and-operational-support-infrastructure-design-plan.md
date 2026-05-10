# Infrastructure and Operational Support Infrastructure Design Plan

## Progress Checklist
- [x] Review functional and NFR design artifacts
- [x] Identify infrastructure mapping decision points
- [x] Draft infrastructure clarification questions
- [x] Collect user answers for the infrastructure questions
- [x] Generate `infrastructure-design.md`
- [x] Generate `deployment-architecture.md`

## Unit Summary
- Unit name: `Infrastructure and Operational Support`
- Scope: mapping workflow orchestration, request state management, event logging, failure notification, and public request entry into actual AWS services
- Design focus: service mapping, deployment topology, environment separation, operational notification path, and shared versus unit-specific infrastructure boundaries

## Question 1
公開入口の実装として、MVP ではどの入口を第一候補にしますか。

A) API Gateway をフロント向け公開入口として採用する  
B) Lambda Function URL など、より軽量な公開入口を優先する  
C) 入口は後続 Unit と合わせて決めるため、この段階では論理境界のみ定義する  
D) フロント公開入口はこの Unit では持たず、内部起動前提で進める  
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
Request の現在状態とイベントログの保存先は、MVP ではどの分け方を優先しますか。

A) どちらも DynamoDB で管理し、テーブルまたは項目設計で分離する  
B) 現在状態は DynamoDB、イベントログは別ストレージへ分ける  
C) まずは単一ストレージで簡単に実装し、将来分離する  
D) 保存方式は Infrastructure Design ではまだ固定しない  
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Slack 通知用 Webhook や各種秘密情報の管理方法として、MVP で優先する方針はどれですか。

A) AWS Secrets Manager で集中管理する  
B) SSM Parameter Store を中心に使う  
C) 開発速度優先で環境変数中心にする  
D) 秘密情報ごとに使い分ける前提で進める  
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
運用監視の構成として、MVP ではどの粒度を優先しますか。

A) CloudWatch Logs / Metrics / Alarm の基本構成で十分  
B) A に加えてダッシュボードも最初から用意したい  
C) A に加えて X-Ray などのトレーシングも入れたい  
D) ログ中心で進め、メトリクスやアラームは最小限にしたい  
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5
この Unit のリソース分離方針として、MVP ではどれを優先しますか。

A) Unit 単位で論理分離するが、AWS アカウントや VPC は共有前提でよい  
B) 可能な限り Unit ごとに独立したリソース群へ分けたい  
C) MVP では共有リソースを多めに使い、分離は後回しにする  
D) 分離方針は後続 Unit を見てから最終決定したい  
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6
デプロイ環境の切り方として、現時点で最低限必要なのはどれですか。

A) `dev` と `prod` の 2 環境  
B) `dev` / `stg` / `prod` の 3 環境  
C) MVP では単一環境でよい  
D) まずは `dev` のみを定義し、他環境は後回しにする  
E) Other (please describe after [Answer]: tag below)

[Answer]: C
