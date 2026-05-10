import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
} from "aws-lambda";

import { GetRequestStatusHandler } from "../api/get-request-status-handler.js";
import { DynamoDbRequestEventLogRepository } from "../repositories/dynamodb-request-event-log-repository.js";
import { DynamoDbRequestStateRepository } from "../repositories/dynamodb-request-state-repository.js";
import { DocumentDynamoDbClient } from "../runtime/document-dynamodb-client.js";

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
  const requestId = event.pathParameters?.requestId;
  const requestStateTable = process.env.REQUEST_STATE_TABLE;
  const requestEventLogTable = process.env.REQUEST_EVENT_LOG_TABLE;

  if (!requestStateTable || !requestEventLogTable) {
    return json(500, {
      message: "Missing required environment variables."
    });
  }

  if (!requestId) {
    return json(400, { message: "requestId path parameter is required." });
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
  const getRequestStatusHandler = new GetRequestStatusHandler(
    stateRepository,
    eventRepository
  );

  const response = await getRequestStatusHandler.handle(requestId);
  if (!response) {
    return json(404, {
      message: "Request not found."
    });
  }

  return json(200, response);
}
