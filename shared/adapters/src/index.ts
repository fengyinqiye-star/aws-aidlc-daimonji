export interface SecretReader {
  readSecret(secretId: string): Promise<string>;
}

export interface SlackWebhookClient {
  send(message: string): Promise<void>;
}
