import { BadGatewayException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type JsonObject = Record<string, unknown>;

@Injectable()
export class AuthMailService {
  private readonly logger = new Logger(AuthMailService.name);
  private readonly apiBaseUrl = 'https://api.mail.hostinger.com/api/v1';

  constructor(private readonly config: ConfigService) {}

  async sendPasswordReset(to: string, username: string, resetUrl: string): Promise<void> {
    const token = this.config.get<string>('HOSTINGER_MAIL_API_TOKEN')?.trim();
    if (!token) throw new ServiceUnavailableException('Password reset email is not configured.');
    const mailboxAddress = this.config.get<string>('HOSTINGER_MAILBOX_ADDRESS', 'sales@gimosupplies.com').trim().toLowerCase();
    const account = await this.request('/me', token);
    const root = this.objectFrom(account, ['account']);
    const mailboxes = this.collectionFrom(root, ['mailboxes', 'items']);
    const mailbox = mailboxes.find((item) => this.stringValue(item.address ?? item.email).toLowerCase() === mailboxAddress);
    const resourceId = this.stringValue(mailbox?.resourceId ?? mailbox?.resource_id ?? mailbox?.id);
    if (!resourceId) throw new ServiceUnavailableException('The configured reset-email mailbox is unavailable.');

    await this.request(`/mailboxes/${encodeURIComponent(resourceId)}/send`, token, {
      to: [to],
      displayName: 'GIMO Laboratory Supplies',
      subject: 'Reset your GIMO internal password',
      text: `Hello ${username},\n\nA password reset was requested for your GIMO internal account.\n\nReset your password within 30 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this email. The link can be used only once.\n\nGIMO Laboratory Supplies`
    });
  }

  private async request(path: string, token: string, body?: JsonObject): Promise<unknown> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(12_000)
      });
      if (!response.ok) {
        this.logger.warn(`Hostinger reset-email request failed with HTTP ${response.status}.`);
        throw new BadGatewayException('Password reset email could not be sent.');
      }
      return response.status === 204 ? null : response.json();
    } catch (error) {
      if (error instanceof BadGatewayException) throw error;
      this.logger.warn('Hostinger reset-email request could not be completed.');
      throw new BadGatewayException('Password reset email could not be sent.');
    }
  }

  private objectFrom(payload: unknown, keys: string[]): JsonObject {
    const data = this.isObject(payload) && 'data' in payload ? payload.data : payload;
    if (!this.isObject(data)) return {};
    for (const key of keys) if (this.isObject(data[key])) return data[key];
    return data;
  }

  private collectionFrom(payload: unknown, keys: string[]): JsonObject[] {
    const data = this.isObject(payload) && 'data' in payload ? payload.data : payload;
    if (Array.isArray(data)) return data.filter((item): item is JsonObject => this.isObject(item));
    if (!this.isObject(data)) return [];
    for (const key of keys) if (Array.isArray(data[key])) return data[key].filter((item): item is JsonObject => this.isObject(item));
    return [];
  }

  private isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }
}
