import type { SlackWebhookClient } from "@shared/adapters";

import type { HighSeverityNotification } from "../notifications/notification-aggregator.js";

export interface HttpPoster {
  post(url: string, body: unknown): Promise<void>;
}

export class SlackWebhookRelay {
  constructor(
    private readonly secrets: { readSecret(secretId: string): Promise<string> },
    private readonly poster: HttpPoster,
    private readonly secretId: string
  ) {}

  async notify(
    client: SlackWebhookClient,
    notification: HighSeverityNotification
  ): Promise<void> {
    const webhookUrl = await this.secrets.readSecret(this.secretId);

    await client.send(
      `[${notification.failureCategory}] ${notification.summary} (${notification.workflowExecutionId})`
    );

    await this.poster.post(webhookUrl, {
      text: `[${notification.failureCategory}] ${notification.summary}`,
      requestId: notification.requestId,
      workflowExecutionId: notification.workflowExecutionId,
      finalState: notification.finalState,
      eventSummaries: notification.eventSummaries
    });
  }
}
