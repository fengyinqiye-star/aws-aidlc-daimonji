import { randomUUID } from "node:crypto";

import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from "aws-lambda";

import { StartRequestHandler } from "../api/start-request-handler.js";
import { DynamoDbRequestEventLogRepository } from "../repositories/dynamodb-request-event-log-repository.js";
import { DynamoDbRequestStateRepository } from "../repositories/dynamodb-request-state-repository.js";
import { DocumentDynamoDbClient } from "../runtime/document-dynamodb-client.js";
import { StepFunctionsOrchestrator } from "../runtime/step-functions-orchestrator.js";
import { WorkflowStarter } from "../workflow/workflow-starter.js";

interface StartRequestBody {
  requestId?: string;
  requesterId?: string;
  mode?: "must-succeed" | "best-effort";
  requestedLeaveDate?: string;
  reasonSummary?: string;
}

function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
}

export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> {
  const requestStateTable = process.env.REQUEST_STATE_TABLE;
  const requestEventLogTable = process.env.REQUEST_EVENT_LOG_TABLE;
  const stateMachineArn = process.env.STATE_MACHINE_ARN;

  if (!requestStateTable || !requestEventLogTable || !stateMachineArn) {
    return json(500, {
      message: "Missing required environment variables."
    });
  }

  if (!event.body) {
    return json(400, { message: "Request body is required." });
  }

  const body = JSON.parse(event.body) as StartRequestBody;
  if (
    !body.requesterId ||
    !body.mode ||
    !body.requestedLeaveDate ||
    !body.reasonSummary
  ) {
    return json(400, {
      message:
        "requesterId, mode, requestedLeaveDate, and reasonSummary are required."
    });
  }

  const client = new DocumentDynamoDbClient();
  const stateRepository = new DynamoDbRequestStateRepository(
    client,
    requestStateTable
  );
  const eventRepository = new DynamoDbRequestEventLogRepository(
    client,
    requestEventLogTable
  );
  const workflowStarter = new WorkflowStarter(
    new StepFunctionsOrchestrator(stateMachineArn)
  );
  const startRequestHandler = new StartRequestHandler(
    stateRepository,
    eventRepository,
    workflowStarter
  );

  const response = await startRequestHandler.handle({
    requestId: body.requestId ?? randomUUID(),
    requesterId: body.requesterId,
    mode: body.mode,
    requestedLeaveDate: body.requestedLeaveDate,
    reasonSummary: body.reasonSummary
  });

  return json(202, response);
}
