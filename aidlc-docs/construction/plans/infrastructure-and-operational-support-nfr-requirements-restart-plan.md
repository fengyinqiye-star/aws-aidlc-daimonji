# Infrastructure and Operational Support NFR Requirements Restart Plan

## Progress Checklist
- [x] Review restarted functional design artifacts for this unit
- [x] Identify restart-specific NFR risk areas and tech-stack decision points
- [x] Draft NFR clarification questions for the restarted scope
- [x] Collect user answers for the NFR questions
- [x] Generate revised `nfr-requirements.md`
- [x] Generate revised `tech-stack-decisions.md`

## Unit Summary
- Unit name: `Infrastructure and Operational Support`
- Restart scope: Step Functions task-level orchestration, Bedrock AgentCore Runtime integration, request tracking backbone, task-level observability, and Frontend-facing API contract support
- NFR focus: Bedrock-aware latency and reliability, task-level failure localization, single-region MVP availability, secure handling of negotiation/legal content, and TypeScript-side PBT framework selection

## Question 1
restart 後のこの Unit で、同時に処理する request 数の前提はどれを基準にしますか。

A) `3〜5` 件程度の同時 request を MVP 基準とする  
B) `10〜20` 件程度まで見込む  
C) デモでは `1〜2` 件を確実に通せればよい  
X) Other (please describe after [Answer]: tag below)

[Answer]:3

## Question 2
`POST /requests` の初回応答と、その後の workflow 進行表示について、MVP で重視する速度はどれですか。

A) 初回応答は数秒以内、進行更新も数秒以内で見えることを重視する  
B) 初回応答は多少遅くてもよく、最終的に正しく進行すればよい  
C) 初回応答だけ速ければよく、進行更新は数十秒単位でも許容する  
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
Bedrock AgentCore Runtime を含む restart 後構成の可用性方針として、MVP ではどれを優先しますか。

A) 単一リージョン前提でよく、障害時は再試行と明示的失敗表示を優先する  
B) 単一リージョン前提だが、Bedrock 障害時はテンプレート応答などの縮退動作も必須にする  
C) リージョン障害まで想定した冗長化を MVP から入れる  
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
交渉文面、法務助言、Slack thread 情報などの機微情報に対するログ／保存の扱いは、MVP でどこまで厳しくしますか。

A) 構造化ログは最小限にし、本文や機微情報は必要最小限のみ保存する  
B) A に加えてマスキング方針までこの段階で定義する  
C) デモ優先で詳細ログも保持するが、後で見直す  
X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 5
task 単位の監視と通知について、MVP で最低限必要な粒度はどれですか。

A) CloudWatch Logs / Metrics / Alarm を task 単位で持ち、重大障害のみ Slack 通知する  
B) A に加えて Step Functions 実行全体のダッシュボードも最初から用意する  
C) まずはログ中心でよく、task 単位の Alarm は最小限にする  
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 6
Frontend Unit が後から Amplify Hosting で接続する前提として、この Unit の NFR で固定したい公開契約の範囲はどれですか。

A) API Base URL、主要 endpoint、必要 environment variable 名まで固定する  
B) API Base URL と endpoint だけ固定し、環境変数は Frontend Unit 側で詰める  
C) この段階では読み取り / 書き込み endpoint の存在だけ決めればよい  
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 7
Property-Based Testing が有効なため、この Unit の TypeScript 実装で採用する PBT framework はどれを第一候補にしますか。

A) `fast-check` を正式採用する  
B) PBT は有効だが framework 選定は次 Unit まで保留し、この Unit では候補だけ記す  
C) 既存 test runner 中心で進め、PBT framework は最小構成にとどめる  
X) Other (please describe after [Answer]: tag below)

[Answer]:A
