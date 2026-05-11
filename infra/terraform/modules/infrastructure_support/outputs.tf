output "api_endpoint" {
  description = "HTTP API endpoint."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "request_state_table_name" {
  description = "Request state table name."
  value       = aws_dynamodb_table.request_state.name
}

output "request_event_log_table_name" {
  description = "Request event log table name."
  value       = aws_dynamodb_table.request_event_log.name
}

output "workflow_state_machine_arn" {
  description = "Workflow state machine ARN."
  value       = aws_sfn_state_machine.workflow.arn
}

output "slack_webhook_secret_arn" {
  description = "Slack webhook secret ARN."
  value       = aws_secretsmanager_secret.slack_webhook.arn
}
