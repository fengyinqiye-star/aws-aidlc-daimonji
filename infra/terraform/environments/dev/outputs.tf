output "api_endpoint" {
  description = "API endpoint for the dev environment."
  value       = module.infrastructure_support.api_endpoint
}

output "request_state_table_name" {
  description = "Request state table name."
  value       = module.infrastructure_support.request_state_table_name
}

output "request_event_log_table_name" {
  description = "Request event log table name."
  value       = module.infrastructure_support.request_event_log_table_name
}

output "workflow_state_machine_arn" {
  description = "Workflow state machine ARN."
  value       = module.infrastructure_support.workflow_state_machine_arn
}
