# Requirements Clarification Questions

以下の質問に、各 `[Answer]:` の行へ選択肢の記号を入力してください。  
該当する選択肢がない場合は最後の `X) Other` を選び、説明を追記してください。

## Question 1
MVP のカレンダー連携対象をどれに固定しますか？

A) Google Calendar のみ
B) Outlook Calendar のみ
C) Google Calendar を主対象にし、Outlook は将来拡張前提で Adapter のみ用意する
X) Other (please describe after [Answer]: tag below)

[Answer]:A
## Question 2
バックエンド実行基盤は MVP でどの方針を採用しますか？

A) AWS Lambda ベースで実装し、Bedrock は通常 API 呼び出しで使う
B) Bedrock AgentCore Runtime を中心に構成する
C) Lambda を主構成にしつつ、AgentCore 置換しやすい抽象化を入れる
X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 3
Slack 投稿はデモでどこまで実動にしますか？

A) 実際の Slack ワークスペースへ投稿できるようにする
B) デフォルトはモック送信、設定時のみ実 Slack 投稿にする
C) 完全モックでよい
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
認証は MVP でどのレベルまで必要ですか？

A) 認証なしのデモ前提でよい
B) ダミーユーザー切替だけ欲しい
C) 最低限のログイン画面だけ用意したい
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
マルチエージェント機能は MVP でどこまで実装対象ですか？

A) オーケストレータと弁護士エージェントを含む最小動作まで入れる
B) UI と設計だけ用意し、実際の SubAgent 分岐はモックでよい
C) 今回は設計上の拡張ポイントのみで十分
X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 6
デモ成功条件の優先順位として最も重視するものはどれですか？

A) 端から端まで必ず通るデモ安定性
B) AI っぽい分析体験の見栄え
C) AWS 構成の説得力
D) Slack 実投稿のインパクト
X) Other (please describe after [Answer]: tag below)

[Answer]:X: Slackに実投稿ができて、最終的に有給取得が可能なようにAI-Agentがネゴシエーションを行えること

## Question 7
セキュリティ拡張ルールをこのプロジェクトで有効化しますか？

A) Yes - enforce all SECURITY rules as blocking constraints
B) No - skip all SECURITY rules
X) Other (please describe after [Answer]: tag below)

[Answer]:B

## Question 8
Property-Based Testing 拡張ルールをこのプロジェクトで有効化しますか？

A) Yes - enforce all PBT rules as blocking constraints
B) Partial - enforce PBT rules only for pure functions and serialization round-trips
C) No - skip all PBT rules
X) Other (please describe after [Answer]: tag below)

[Answer]:A
