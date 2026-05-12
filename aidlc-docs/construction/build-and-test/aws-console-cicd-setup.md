# AWS Console / GitHub 設定手順

この手順は、`Deploy Infrastructure Support` GitHub Actions workflow を AWS 上で動かすための事前設定です。  
対象は以下です。

- GitHub Actions から AWS へ OIDC で接続する
- Terraform remote state を使えるようにする
- Lambda artifact を配置できるようにする
- `deploy.yml` 実行前の GitHub Variables を揃える

## 前提
- AWS アカウントにログインできること
- GitHub リポジトリ管理権限があること
- 対象リポジトリ:
  - `fengyinqiye-star/aws-aidlc-daimonji`
- 利用ブランチ:
  - `construction`
  - `main`
- GitHub Actions workflow:
  - `.github/workflows/deploy.yml`

## 全体の作業順
1. GitHub OIDC Provider を作成する
2. GitHub Actions 用 IAM Role を作成する
3. IAM Role に deploy 用 policy を付ける
4. Terraform state 用 S3 bucket を作る
5. Terraform lock 用 DynamoDB table を作る
6. Lambda artifact 用 S3 bucket を作る
7. Slack webhook 用 Secrets Manager secret を作る
8. GitHub Variables を設定する
9. Lambda artifact を S3 へ配置する
10. GitHub Actions から deploy を実行する
11. deploy 後に Slack webhook secret の値を投入する
12. デプロイ後の AWS リソースを確認する

## 1. GitHub OIDC Provider を作成する
1. AWS Console を開く
2. 検索バーで `IAM` を開く
3. 左メニューで `Identity providers` を選ぶ
4. `Add provider` を押す
5. 以下を入力する
   - Provider type:
     - `OpenID Connect`
   - Provider URL:
     - `https://token.actions.githubusercontent.com`
   - Audience:
     - `sts.amazonaws.com`
6. 入力内容を確認して保存する

### 作成後確認
- `Identity providers` 一覧に `token.actions.githubusercontent.com` が表示されること

## 2. GitHub Actions 用 IAM Role を作成する
1. AWS Console で `IAM` を開く
2. 左メニューで `Roles` を選ぶ
3. `Create role` を押す
4. Trusted entity type は `Web identity` を選ぶ
5. 以下を選択する
   - Identity provider:
     - `token.actions.githubusercontent.com`
   - Audience:
     - `sts.amazonaws.com`
6. 次へ進む
7. Permissions はここでは空でもよい
   - 後で inline policy を追加する
8. Role name を入力する
   - 例:
   - `aws-aidlc-daimonji-github-actions-terraform-deploy`
9. 説明を必要なら入力して作成する

### 作成後に Trust relationship を編集する
1. 作成した role を開く
2. `Trust relationships` タブを開く
3. `Edit trust policy` を押す
4. 以下をベースに編集する

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:fengyinqiye-star/aws-aidlc-daimonji:ref:refs/heads/construction",
            "repo:fengyinqiye-star/aws-aidlc-daimonji:ref:refs/heads/main",
            "repo:fengyinqiye-star/aws-aidlc-daimonji:environment:dev"
          ]
        }
      }
    }
  ]
}
```

### 補足
- GitHub Organization は不要
- 個人リポジトリなら `repo:<ユーザー名>/<リポジトリ名>:...` を使う
- `environment:dev` は GitHub Environment を使う場合のみ必要
- まず branch 制限だけで始めるなら `environment:dev` は外してよい

## 3. IAM Role に deploy 用 policy を付ける
この role は Terraform を通じて複数サービスを作成・更新するため、最初は inline policy を付ける方が扱いやすいです。

### 3-1. Policy を追加する
1. 作成した role を開く
2. `Permissions` タブを開く
3. `Add permissions` を押す
4. `Create inline policy` を選ぶ
5. `JSON` タブへ切り替える

### 3-2. Visual editor で選ぶサービスとアクセスレベル
`Create inline policy` の `Visual editor` を使う場合は、以下の粒度で選ぶのが最初の実務案です。  
ここでは「そのカテゴリを全部許可する」のか、「カテゴリを開いて個別アクションだけ選ぶ」のかまで書いています。

画面上のカテゴリ:
- `List`
- `Read`
- `Write`
- `Permissions management`
- `Tagging`

### A. S3
用途:
- Terraform state bucket の state ファイル読み書き
- 必要なら artifact bucket の object 参照

操作:
1. Service で `S3` を選ぶ
2. `List` を開く
3. `All list actions` は**選ばない**
4. 以下を選ぶ
   - `ListBucket`
   - `ListBucketMultipartUploads`
   - `ListBucketVersions`
   - `ListAllMyBuckets`
5. `Read` を開く
6. `All read actions` は**選ばない**
7. 以下を選ぶ
   - `GetBucketLocation`
   - `GetBucketVersioning`
   - `GetEncryptionConfiguration`
   - `GetObject`
   - `GetObjectVersion`
8. `Write` を開く
9. `All write actions` は**選ばない**
10. 以下を選ぶ
   - `PutObject`
   - `DeleteObject`
   - `AbortMultipartUpload`
11. `Permissions management` は**何も選ばない**
12. `Tagging` は**何も選ばない**

補足:
- この role では bucket 自体は手動作成前提なので、`CreateBucket` / `DeleteBucket` は不要
- artifact upload を GitHub Actions で自動化していないなら、artifact bucket への `PutObject` も必須ではない
- ただし同じ role で将来 upload もやるなら `PutObject` は残してよい

### B. DynamoDB
用途:
- Terraform lock table の使用
- Terraform による request state / event log table 作成更新

操作:
1. Service で `DynamoDB` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` は**何も選ばない**
9. `Tagging` を開く
10. **`All tagging actions` を選ぶ**

補足:
- lock table と application table を両方扱うため、最初は DynamoDB は広めでよい

### C. Lambda
用途:
- function 作成
- code 更新
- environment variable 更新
- permission resource 作成

操作:
1. Service で `Lambda` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` を開く
9. **`All permissions management actions` を選ぶ**
10. `Tagging` を開く
11. **`All tagging actions` を選ぶ**

補足:
- `aws_lambda_permission` を Terraform で作るため、`Permissions management` が必要

### D. Step Functions
用途:
- state machine 作成更新

操作:
1. Service で `Step Functions` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` は**何も選ばない**
9. `Tagging` を開く
10. **`All tagging actions` を選ぶ**

### E. API Gateway
用途:
- HTTP API
- integration
- route
- stage

操作:
1. Service で `API Gateway` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` は**何も選ばない**
9. `Tagging` を開く
10. **`All tagging actions` を選ぶ**

### F. CloudWatch Logs
用途:
- log group 作成
- retention 設定

操作:
1. Service で `CloudWatch Logs` または `Logs` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` は**何も選ばない**
9. `Tagging` を開く
10. **`All tagging actions` を選ぶ**

### G. Secrets Manager
用途:
- Terraform による secret リソース作成

操作:
1. Service で `Secrets Manager` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` は**何も選ばない**
9. `Tagging` を開く
10. **`All tagging actions` を選ぶ**

補足:
- **現在の Terraform では `aws_secretsmanager_secret.slack_webhook` を作成します**
- そのため、**最初の deploy 前に同名 secret を手作業で作らない方が安全**です
- 先に手作業で作る場合は Terraform import が必要になります

### H. IAM
用途:
- Lambda execution role 作成
- Step Functions execution role 作成
- inline policy 作成
- role をサービスへ渡す

操作:
1. Service で `IAM` を選ぶ
2. `List` を開く
3. **`All list actions` を選ぶ**
4. `Read` を開く
5. **`All read actions` を選ぶ**
6. `Write` を開く
7. **`All write actions` を選ぶ**
8. `Permissions management` を開く
9. **`All permissions management actions` を選ぶ**
10. `Tagging` を開く
11. **`All tagging actions` を選ぶ**

補足:
- `iam:PassRole` を含めるため `Permissions management` が必要
- IAM は広めなので、後から CloudTrail を見て絞る前提で始める

### 3-3. JSON で追加しておくべき意識
Visual editor だけでは不足が出やすいので、最終的には `JSON` タブで確認してください。  
特に以下は重要です。

- `iam:PassRole`
- Terraform state bucket の object 読み書き
- Terraform lock table の更新
- Lambda / Step Functions / API Gateway / Logs / DynamoDB / Secrets Manager の作成更新系

### 3-4. まず通すための方針
- 最初はやや広めに付ける
- 初回 apply 成功後に CloudTrail や Terraform エラーを見て絞る

### 3-5. 保存する
1. policy name を入力する
   - 例:
     - `aws-aidlc-daimonji-github-actions-terraform-deploy-inline`
2. 保存する

## 4. Terraform state 用 S3 bucket を作成する
1. AWS Console で `S3` を開く
2. `Create bucket` を押す
3. bucket 名を入力する
   - 例:
     - `aws-aidlc-daimonji-terraform-state`
4. Region は deploy 対象リージョンに合わせる
   - 例:
     - `ap-northeast-1`
5. `Block all public access` は有効のままにする
6. `Bucket Versioning` を有効にする
7. bucket を作成する

### 作成後確認
- bucket が存在すること
- versioning が `Enabled` になっていること

## 5. Terraform lock 用 DynamoDB table を作成する
1. AWS Console で `DynamoDB` を開く
2. `Create table` を押す
3. 以下を入力する
   - Table name:
     - 例: `aws-aidlc-daimonji-terraform-lock`
   - Partition key:
     - `LockID`
   - Type:
     - `String`
4. Capacity mode は `On-demand` でよい
5. table を作成する

### 作成後確認
- table が `Active` になること

## 6. Lambda artifact 用 S3 bucket を作成する
1. AWS Console で `S3` を開く
2. `Create bucket` を押す
3. bucket 名を入力する
   - 例:
     - `aws-aidlc-daimonji-lambda-artifacts`
4. Region は deploy 対象リージョンに合わせる
5. `Block all public access` は有効のままにする
6. bucket を作成する

### 用途
- `start-request` Lambda の ZIP
- `get-request-status` Lambda の ZIP

## 7. Slack webhook secret の名前を先に決める
現在の Terraform は secret 本体の**器**を作成します。  
そのため、最初の deploy 前に必要なのは「作成する secret 名を決めること」です。

1. 使用する secret 名を決める
   - 例:
     - `vacation-negotiation/dev/slack-webhook`
2. この値を GitHub Variable `SLACK_WEBHOOK_SECRET_NAME` に設定する

### 注意
- **初回 deploy 前に同名の secret を手動作成しない**
- 先に作ると Terraform apply で name conflict になる可能性があります

## 8. GitHub Repository Variables を設定する
1. GitHub で対象リポジトリを開く
2. `Settings` を開く
3. 左メニューで `Secrets and variables` -> `Actions` を開く
4. `Variables` タブを開く
5. 以下を 1 件ずつ追加する

### 必須 Variables
- `AWS_REGION`
  - 例: `ap-northeast-1`
- `AWS_DEPLOY_ROLE_ARN`
  - 例: `arn:aws:iam::<AWS_ACCOUNT_ID>:role/github-actions-terraform-deploy`
- `TERRAFORM_STATE_BUCKET`
  - 例: `aws-aidlc-daimonji-terraform-state`
- `TERRAFORM_LOCK_TABLE`
  - 例: `aws-aidlc-daimonji-terraform-lock`
- `TERRAFORM_NAME_PREFIX`
  - 例: `vacation-negotiation-dev`
- `LAMBDA_ARTIFACT_BUCKET`
  - 例: `aws-aidlc-daimonji-lambda-artifacts`
- `SLACK_WEBHOOK_SECRET_NAME`
  - 例: `vacation-negotiation/dev/slack-webhook`

### GitHub Environment を使う場合
1. `Settings` -> `Environments` を開く
2. `dev` を作成する
3. `deploy.yml` の `environment: dev` と揃える

## 9. Lambda artifact を S3 に配置する
`deploy.yml` は ZIP 作成と upload を自動化していないため、先に artifact bucket に置く必要があります。

### 9-1. ZIP を作る
想定する deploy 対象:
- `start-request`
- `get-request-status`

### 9-2. S3 へアップロードする
artifact bucket へ次の key でアップロードする例:
- `infrastructure-support/start-request.zip`
- `infrastructure-support/get-request-status.zip`

### 9-3. deploy.yml に入力する値
- `start_request_artifact_key`
  - 例: `infrastructure-support/start-request.zip`
- `get_request_status_artifact_key`
  - 例: `infrastructure-support/get-request-status.zip`

## 10. GitHub Actions から deploy を実行する
1. GitHub で `Actions` タブを開く
2. 左から `Deploy Infrastructure Support` を選ぶ
3. `Run workflow` を押す
4. 入力する
   - environment:
     - `dev`
   - start_request_artifact_key:
     - 例: `infrastructure-support/start-request.zip`
   - get_request_status_artifact_key:
     - 例: `infrastructure-support/get-request-status.zip`
5. 実行する

### 実行中の確認ポイント
- `Configure AWS credentials` が成功すること
- `Terraform init` が成功すること
- `Terraform apply` が成功すること

## 11. deploy 後に Slack webhook secret の値を投入する
1. AWS Console で `Secrets Manager` を開く
2. deploy により作成された secret を開く
   - 例:
     - `vacation-negotiation/dev/slack-webhook`
3. `Retrieve secret value` または `Edit secret` を選ぶ
4. Slack webhook URL を保存する

## 12. デプロイ後に AWS Console で確認する

### API Gateway
1. `API Gateway` を開く
2. HTTP API が作成されていることを確認する
3. `$default` stage があることを確認する
4. invoke URL を控える

### Lambda
1. `Lambda` を開く
2. 以下 2 つの function が存在することを確認する
   - `...-start-request`
   - `...-get-request-status`
3. 環境変数が入っていることを確認する

### Step Functions
1. `Step Functions` を開く
2. state machine が作成されていることを確認する

### DynamoDB
1. `DynamoDB` を開く
2. request state table があることを確認する
3. request event log table があることを確認する

### CloudWatch Logs
1. `CloudWatch` -> `Log groups` を開く
2. Lambda 用 log group があることを確認する
3. Step Functions 用 log group があることを確認する
4. API Gateway 用 log group があることを確認する

## 12. 最初に詰まりやすいポイント

### OIDC assume role で失敗する
- Trust policy の `sub` が branch / environment と一致しているか確認する
- `AWS_DEPLOY_ROLE_ARN` が正しいか確認する

### Terraform init で失敗する
- state bucket 名が正しいか確認する
- lock table 名が正しいか確認する
- role に S3 / DynamoDB 権限があるか確認する

### Terraform apply で失敗する
- role に Lambda / API Gateway / Step Functions / IAM / Logs / Secrets Manager 権限があるか確認する
- Lambda artifact bucket と object key が正しいか確認する

### Lambda が起動しない
- ZIP 内容と handler パスが一致しているか確認する
- CloudWatch Logs を確認する

## 13. この手順で最後に控えるべき値
- OIDC provider 作成済み
- deploy role ARN
- Terraform state bucket 名
- Terraform lock table 名
- Lambda artifact bucket 名
- Slack webhook secret 名
- API Gateway invoke URL
