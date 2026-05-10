data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

resource "aws_dynamodb_table" "request_state" {
  name         = "${var.name_prefix}-request-state"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "requestId"

  attribute {
    name = "requestId"
    type = "S"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "request_event_log" {
  name         = "${var.name_prefix}-request-event-log"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "requestId"
  range_key    = "eventKey"

  attribute {
    name = "requestId"
    type = "S"
  }

  attribute {
    name = "eventKey"
    type = "S"
  }

  tags = var.tags
}

resource "aws_secretsmanager_secret" "slack_webhook" {
  name = var.slack_webhook_secret_name

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "start_request_lambda" {
  name              = "/aws/lambda/${var.name_prefix}-start-request"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "get_request_status_lambda" {
  name              = "/aws/lambda/${var.name_prefix}-get-request-status"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "state_machine" {
  name              = "/aws/vendedlogs/states/${var.name_prefix}-workflow"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}-http-api"
  retention_in_days = 30

  tags = var.tags
}

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda_execution" {
  name               = "${var.name_prefix}-lambda-execution"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "lambda_execution" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "${aws_cloudwatch_log_group.start_request_lambda.arn}:*",
      "${aws_cloudwatch_log_group.get_request_status_lambda.arn}:*"
    ]
  }

  statement {
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:Query"
    ]
    resources = [
      aws_dynamodb_table.request_state.arn,
      aws_dynamodb_table.request_event_log.arn
    ]
  }

  statement {
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_secretsmanager_secret.slack_webhook.arn]
  }

  statement {
    actions = ["states:StartExecution"]
    resources = [
      aws_sfn_state_machine.workflow.arn
    ]
  }
}

resource "aws_iam_role_policy" "lambda_execution" {
  name   = "${var.name_prefix}-lambda-execution"
  role   = aws_iam_role.lambda_execution.id
  policy = data.aws_iam_policy_document.lambda_execution.json
}

data "aws_iam_policy_document" "step_functions_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["states.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "step_functions_execution" {
  name               = "${var.name_prefix}-step-functions-execution"
  assume_role_policy = data.aws_iam_policy_document.step_functions_assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "step_functions_execution" {
  statement {
    actions = ["lambda:InvokeFunction"]
    resources = [
      aws_lambda_function.start_request.arn,
      aws_lambda_function.get_request_status.arn
    ]
  }

  statement {
    actions = [
      "logs:CreateLogDelivery",
      "logs:GetLogDelivery",
      "logs:UpdateLogDelivery",
      "logs:DeleteLogDelivery",
      "logs:ListLogDeliveries",
      "logs:PutResourcePolicy",
      "logs:DescribeResourcePolicies",
      "logs:DescribeLogGroups"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "step_functions_execution" {
  name   = "${var.name_prefix}-step-functions-execution"
  role   = aws_iam_role.step_functions_execution.id
  policy = data.aws_iam_policy_document.step_functions_execution.json
}

resource "aws_lambda_function" "start_request" {
  function_name = "${var.name_prefix}-start-request"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "dist/lambda/start-request.handler"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 512
  s3_bucket     = var.artifact_bucket
  s3_key        = var.start_request_artifact_key

  environment {
    variables = {
      REQUEST_STATE_TABLE    = aws_dynamodb_table.request_state.name
      REQUEST_EVENT_LOG_TABLE = aws_dynamodb_table.request_event_log.name
      STATE_MACHINE_ARN      = aws_sfn_state_machine.workflow.arn
      SLACK_WEBHOOK_SECRET   = aws_secretsmanager_secret.slack_webhook.name
    }
  }

  depends_on = [aws_cloudwatch_log_group.start_request_lambda]
  tags       = var.tags
}

resource "aws_lambda_function" "get_request_status" {
  function_name = "${var.name_prefix}-get-request-status"
  role          = aws_iam_role.lambda_execution.arn
  handler       = "dist/lambda/get-request-status.handler"
  runtime       = "nodejs22.x"
  timeout       = 30
  memory_size   = 512
  s3_bucket     = var.artifact_bucket
  s3_key        = var.get_request_status_artifact_key

  environment {
    variables = {
      REQUEST_STATE_TABLE     = aws_dynamodb_table.request_state.name
      REQUEST_EVENT_LOG_TABLE = aws_dynamodb_table.request_event_log.name
      SLACK_WEBHOOK_SECRET    = aws_secretsmanager_secret.slack_webhook.name
    }
  }

  depends_on = [aws_cloudwatch_log_group.get_request_status_lambda]
  tags       = var.tags
}

locals {
  workflow_definition = jsonencode({
    Comment = "Infrastructure support workflow orchestration"
    StartAt = "RecordAcceptance"
    States = {
      RecordAcceptance = {
        Type     = "Task"
        Resource = aws_lambda_function.start_request.arn
        End      = true
      }
    }
  })
}

resource "aws_sfn_state_machine" "workflow" {
  name       = "${var.name_prefix}-workflow"
  role_arn   = aws_iam_role.step_functions_execution.arn
  definition = local.workflow_definition

  logging_configuration {
    level                  = "ALL"
    include_execution_data = true
    log_destination        = "${aws_cloudwatch_log_group.state_machine.arn}:*"
  }

  tags = var.tags
}

resource "aws_apigatewayv2_api" "http" {
  name          = "${var.name_prefix}-http-api"
  protocol_type = "HTTP"

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "start_request" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.start_request.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "get_request_status" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.get_request_status.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "start_request" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /requests"
  target    = "integrations/${aws_apigatewayv2_integration.start_request.id}"
}

resource "aws_apigatewayv2_route" "get_request_status" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /requests/{requestId}"
  target    = "integrations/${aws_apigatewayv2_integration.get_request_status.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      requestTime    = "$context.requestTime"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      responseLength = "$context.responseLength"
    })
  }

  tags = var.tags
}

resource "aws_lambda_permission" "allow_api_gateway_start_request" {
  statement_id  = "AllowApiGatewayInvokeStartRequest"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.start_request.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_api_gateway_get_request_status" {
  statement_id  = "AllowApiGatewayInvokeGetRequestStatus"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_request_status.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
