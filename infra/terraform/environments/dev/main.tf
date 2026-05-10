provider "aws" {
  region = var.region
}

module "infrastructure_support" {
  source = "../../modules/infrastructure_support"

  name_prefix                   = var.name_prefix
  region                        = var.region
  artifact_bucket               = var.artifact_bucket
  start_request_artifact_key    = var.start_request_artifact_key
  get_request_status_artifact_key = var.get_request_status_artifact_key
  slack_webhook_secret_name     = var.slack_webhook_secret_name
  tags                          = var.tags
}
