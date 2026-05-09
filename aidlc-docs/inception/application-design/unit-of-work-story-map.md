# Unit of Work とストーリー対応

## ストーリー対応表

| ストーリー | 関連 Unit | 関与度 | 補足 |
|---|---|---|---|
| US-01 絶対休めるモードで有休取得を成立させたい | Frontend Experience | Primary | チャット、要約、Slack レビュー、Calendar 確認 UI |
| US-01 絶対休めるモードで有休取得を成立させたい | Backend Chat Intake and Tracking | Primary | 会話進行、不足情報収集、状態管理 |
| US-01 絶対休めるモードで有休取得を成立させたい | Backend Negotiation and Escalation | Primary | 交渉方針生成、Slack ドラフト、弁護士エージェント参加 |
| US-01 絶対休めるモードで有休取得を成立させたい | Calendar Registration | Primary | 成立後の確認と Calendar 登録 |
| US-01 絶対休めるモードで有休取得を成立させたい | Infrastructure and Operational Support | Supporting | Step Functions、Secrets、可観測性、フォールバック |
| US-02 できれば休みたいモードで誠実に交渉結果を受け取りたい | Frontend Experience | Primary | フィードバック表示、Slack レビュー、結果確認 UI |
| US-02 できれば休みたいモードで誠実に交渉結果を受け取りたい | Backend Chat Intake and Tracking | Primary | 会話進行、不足情報収集、状態管理 |
| US-02 できれば休みたいモードで誠実に交渉結果を受け取りたい | Backend Negotiation and Escalation | Primary | 相談型交渉、非強制エスカレーション、フィードバック整形 |
| US-02 できれば休みたいモードで誠実に交渉結果を受け取りたい | Calendar Registration | Conditional | 成立時のみ Calendar 登録対象 |
| US-02 できれば休みたいモードで誠実に交渉結果を受け取りたい | Infrastructure and Operational Support | Supporting | ログ、フォールバック、外部連携基盤 |
| FUT-01 有休交渉以外の言いにくい依頼にも拡張したい | Backend Negotiation and Escalation | Future | 将来の交渉ロジック拡張起点 |
| FUT-01 有休交渉以外の言いにくい依頼にも拡張したい | Infrastructure and Operational Support | Future | 将来の拡張余地に関係 |

## 単位ごとの責務カバレッジ

### Frontend Experience
- US-01 のチャット、レビュー、確認 UI を担う
- US-02 の相談型フィードバック表示を担う

### Backend Chat Intake and Tracking
- 両 MVP ストーリーの会話開始と状態追跡を担う

### Backend Negotiation and Escalation
- 両 MVP ストーリーの交渉コアを担う
- `絶対休めるモード` の弁護士エージェント参加を担う
- `できれば休みたいモード` の不成立フィードバックを担う

### Calendar Registration
- US-01 の成立後登録を担う
- US-02 の成立時のみ条件付きで関与する

### Infrastructure and Operational Support
- 全 MVP ストーリーの実行基盤とデモ信頼性を支える

## 割り当て確認
- すべての MVP ストーリーは少なくとも 1 つ以上の Primary Unit に割り当て済み
- 将来ストーリーは Future 扱いとして分離済み
