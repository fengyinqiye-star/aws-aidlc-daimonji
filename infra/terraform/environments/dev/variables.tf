variable "region" {
  description = "AWS region for deployment."
  type        = string
}

variable "name_prefix" {
  description = "Prefix for all resource names."
  type        = string
}

variable "artifact_bucket" {
  description = "Artifact bucket for Lambda ZIP uploads."
  type        = string
}

variable "start_request_artifact_key" {
  description = "Object key for the start request Lambda artifact."
  type        = string
}

variable "get_request_status_artifact_key" {
  description = "Object key for the get request status Lambda artifact."
  type        = string
}

variable "slack_webhook_secret_name" {
  description = "Secret name used for the Slack webhook."
  type        = string
}

variable "tags" {
  description = "Common resource tags."
  type        = map(string)
  default     = {}
}
