variable "name_prefix" {
  description = "Resource name prefix."
  type        = string
}

variable "region" {
  description = "AWS region."
  type        = string
}

variable "artifact_bucket" {
  description = "S3 bucket containing Lambda deployment packages."
  type        = string
}

variable "start_request_artifact_key" {
  description = "S3 object key for the start request Lambda package."
  type        = string
}

variable "get_request_status_artifact_key" {
  description = "S3 object key for the get request status Lambda package."
  type        = string
}

variable "slack_webhook_secret_name" {
  description = "Secrets Manager secret name for Slack webhook."
  type        = string
}

variable "tags" {
  description = "Tags applied to all resources."
  type        = map(string)
  default     = {}
}
