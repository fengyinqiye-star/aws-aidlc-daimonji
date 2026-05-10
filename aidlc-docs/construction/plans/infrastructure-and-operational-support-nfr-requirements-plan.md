# Infrastructure and Operational Support NFR Requirements Plan

## Progress Checklist
- [x] Review functional design artifacts for this unit
- [x] Identify NFR risk areas and tech-stack decision points
- [x] Draft NFR clarification questions
- [x] Collect user answers for the NFR questions
- [x] Generate `nfr-requirements.md`
- [x] Generate `tech-stack-decisions.md`

## Unit Summary
- Unit name: `Infrastructure and Operational Support`
- Scope: orchestration, request tracking, retry control, auditability, observability, and workflow-level failure handling
- NFR focus: demo reliability, response expectations, operational visibility, recoverability, and AWS service choices

## Question 1
MVP デモ時の同時利用負荷として、この Unit が最低限耐えるべき想定はどれですか。

A) 1 件ずつの直列デモ利用を安定して処理できればよい  
B) 3〜5 件程度の並行リクエストまでは安定して処理したい  
C) 10 件以上の並行リクエストを見据えたい  
D) 同時利用数は未定なので、まずは単一利用に最適化する  
E) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 2
ユーザーに返す進行状況の更新頻度として、MVP で求める体験はどれですか。

A) 状態が変わるたびに数秒以内で反映されればよい  
B) 数十秒単位でもよいので確実性を優先したい  
C) リアルタイム性より、手動更新でもよい  
D) デモ時のみ即時反映、それ以外は遅延許容でよい  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
可用性の考え方として、MVP ではどの水準を優先しますか。

A) 単一リージョン前提で、障害時は手動復旧でもよい  
B) 単一リージョン前提だが、主要障害は自動再試行で吸収したい  
C) リージョン障害も見据えた冗長化を最初から考えたい  
D) デモ専用なので、復旧より開発速度を優先したい  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
監査ログや交渉履歴に含まれるデータ保護要件として、MVP で最低限必要なのはどれですか。

A) AWS マネージドサービス標準の暗号化と IAM 制御があればよい  
B) A に加えて保存期間や削除方針も明文化したい  
C) B に加えて個人情報のマスキング要件も最初から入れたい  
D) デモ優先なので保護要件は最小限にしたい  
E) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
障害通知と監視について、MVP で必要な運用レベルはどれですか。

A) CloudWatch Logs と基本メトリクスで十分  
B) A に加えて失敗時の通知先を 1 つ決めたい  
C) B に加えてトレースや構造化ログまで含めたい  
D) デモ時は手動確認前提で、監視は最小限でよい  
E) Other (please describe after [Answer]: tag below)

[Answer]:E: Aに加え、必要最低限な高レベルログについてのみWebhookにてSlack通知を行う

## Question 6
この Unit の技術選定で、現時点で強く固定したい AWS サービス方針はどれですか。

A) Step Functions / Lambda / DynamoDB / CloudWatch を第一候補として進めたい  
B) オーケストレーション以外は後続の Infrastructure Design で柔軟に決めたい  
C) できるだけ API Gateway 中心でシンプルに寄せたい  
D) 将来の差し替えを見越し、特定サービスへの依存を弱めたい  
E) Other (please describe after [Answer]: tag below)

[Answer]:B
