# ビルド手順

## 対象
- Unit: `Infrastructure and Operational Support`
- 対象ディレクトリ:
  - `backend/infrastructure-support`
  - `infra/terraform`
  - `.github/workflows`

## ローカルビルド手順
1. backend 依存をインストールする
   - `npm install --prefix backend/infrastructure-support`
2. TypeScript をビルドする
   - `npm run build --prefix backend/infrastructure-support`
3. `backend/infrastructure-support/dist/` に出力が生成されることを確認する

## ローカル品質確認
- CI 相当の backend 確認:
  - `npm run backend:check`

## Terraform 確認
1. フォーマット確認
   - `npm run terraform:fmt:check`
2. 構成妥当性確認
   - `npm run terraform:validate`

## CI の期待結果
- `ci.yml` で以下が成功すること
  - `backend-unit`
  - `backend-integration`
  - `terraform`

## CD の前提
- `deploy.yml` 実行前に Lambda 用 ZIP を artifact bucket へアップロードしておくこと
- GitHub Actions の repository variables が設定済みであること
