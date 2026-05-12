# 性能テスト手順

## 現状
- この Unit には専用の性能テストはまだありません

## MVP 向け最低限の確認
- ローカルの build / test コマンドが異常に遅くならないこと
- 将来のデプロイ後スモークテストで `StartRequestHandler` 経路が通常の Lambda / API 応答時間内に収まること

## 後続で必要な作業
- API レイテンシの同時リクエスト測定
- Step Functions 起動遅延の測定
- request status polling 時の DynamoDB 応答時間測定

## 推奨
- frontend とデプロイ後統合経路が揃ってから性能テストを実施する
