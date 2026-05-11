import type { SecretReader } from "@shared/adapters";

export interface SecretsManagerApi {
  getSecretValue(secretId: string): Promise<string>;
}

export class SecretsManagerReader implements SecretReader {
  constructor(private readonly api: SecretsManagerApi) {}

  readSecret(secretId: string): Promise<string> {
    return this.api.getSecretValue(secretId);
  }
}
