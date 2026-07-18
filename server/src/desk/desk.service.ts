import { BadGatewayException, ConflictException, Injectable, Logger, NotFoundException, PayloadTooLargeException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeskClientDto } from './dto/create-desk-client.dto';
import { DeskClientEntity } from './entities/desk-client.entity';
import { DeskMessageAssignmentEntity } from './entities/desk-message-assignment.entity';

type JsonObject = Record<string, unknown>;

export interface MailAddress {
  name: string | null;
  address: string;
}

export interface DeskClientModel {
  id: number;
  name: string;
  emailAddress: string | null;
  emailDomain: string | null;
}

export interface DeskMessage {
  uid: string;
  subject: string;
  from: MailAddress;
  receivedAt: string | null;
  preview: string;
  unread: boolean;
  hasAttachments: boolean;
  client: DeskClientModel | null;
  assignmentSource: 'manual' | 'rule' | null;
}

export interface DeskThreadMessage extends DeskMessage {
  folder: string;
  direction: 'incoming' | 'outgoing';
  bodyText: string;
  messageId: string | null;
  inReplyTo: string | null;
  attachments: DeskAttachment[];
  quotedHistoryHidden: boolean;
}

export interface DeskAttachment {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  inline: boolean;
  previewable: boolean;
}

@Injectable()
export class DeskService {
  private readonly logger = new Logger(DeskService.name);
  private readonly apiBaseUrl = 'https://api.mail.hostinger.com/api/v1';

  constructor(
    @InjectRepository(DeskClientEntity) private readonly clients: Repository<DeskClientEntity>,
    @InjectRepository(DeskMessageAssignmentEntity) private readonly assignments: Repository<DeskMessageAssignmentEntity>,
    private readonly config: ConfigService
  ) {}

  async listClients(): Promise<DeskClientModel[]> {
    const clients = await this.clients.find({ order: { name: 'ASC' } });
    return clients.map((client) => this.toClientModel(client));
  }

  async createClient(input: CreateDeskClientDto): Promise<DeskClientModel> {
    const name = input.name.trim();
    const existing = await this.clients.createQueryBuilder('client').where('LOWER(client.name) = LOWER(:name)', { name }).getOne();
    if (existing) throw new ConflictException('A Desk client with this name already exists.');

    const client = await this.clients.save(this.clients.create({
      name,
      emailAddress: input.emailAddress?.trim().toLowerCase() || null,
      emailDomain: input.emailDomain?.trim().toLowerCase() || null
    }));
    return this.toClientModel(client);
  }

  async listInbox(folder = 'INBOX'): Promise<{ mailbox: string; folder: string; messages: DeskMessage[] }> {
    const mailbox = await this.resolveMailbox();
    const payload = await this.hostingerRequest(`/mailboxes/${encodeURIComponent(mailbox.resourceId)}/folders/${encodeURIComponent(folder)}/messages`);
    const rows = this.collectionFrom(payload, ['messages', 'items']);
    const [clients, assignments] = await Promise.all([
      this.clients.find({ order: { name: 'ASC' } }),
      this.assignments.find({
        where: { mailboxResourceId: mailbox.resourceId, folder },
        relations: { client: true }
      })
    ]);
    const assignmentByUid = new Map(assignments.map((assignment) => [assignment.messageUid, assignment.client]));
    const messages = rows
      .map((row) => this.toMessage(row, clients, assignmentByUid))
      .filter((message): message is DeskMessage => message !== null);
    return { mailbox: mailbox.address, folder, messages };
  }

  async getMessage(uid: string, folder = 'INBOX'): Promise<DeskMessage & { to: MailAddress[]; bodyText: string }> {
    this.assertMessageUid(uid);
    const mailbox = await this.resolveMailbox();
    const basePath = `/mailboxes/${encodeURIComponent(mailbox.resourceId)}/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(uid)}`;
    const [messagePayload, textPayload, clients, assignment] = await Promise.all([
      this.hostingerRequest(basePath),
      this.hostingerRequest(`${basePath}/text`).catch(() => null),
      this.clients.find({ order: { name: 'ASC' } }),
      this.assignments.findOne({
        where: { mailboxResourceId: mailbox.resourceId, folder, messageUid: uid },
        relations: { client: true }
      })
    ]);
    const row = this.objectFrom(messagePayload, ['message']);
    const assignmentByUid = new Map<string, DeskClientEntity>();
    if (assignment) assignmentByUid.set(uid, assignment.client);
    const message = this.toMessage({ ...row, uid: this.stringValue(row.uid ?? row.id) || uid }, clients, assignmentByUid);
    if (!message) throw new NotFoundException('Email message not found.');
    const bodyText = this.plainTextFrom(textPayload) || this.stringValue(row.text ?? row.bodyText) || 'This message does not include a plain-text body.';
    return { ...message, to: this.addressList(row.to ?? row.recipients), bodyText };
  }

  async getThread(uid: string, folder = 'INBOX'): Promise<{
    mailbox: string;
    ticket: DeskMessage & { to: MailAddress[] };
    messages: DeskThreadMessage[];
  }> {
    this.assertMessageUid(uid);
    const mailbox = await this.resolveMailbox();
    const encodedMailbox = encodeURIComponent(mailbox.resourceId);
    const anchorPath = `/mailboxes/${encodedMailbox}/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(uid)}`;
    const [anchorPayload, foldersPayload, clients, assignment] = await Promise.all([
      this.hostingerRequest(anchorPath),
      this.hostingerRequest(`/mailboxes/${encodedMailbox}/folders`),
      this.clients.find({ order: { name: 'ASC' } }),
      this.assignments.findOne({ where: { mailboxResourceId: mailbox.resourceId, folder, messageUid: uid }, relations: { client: true } })
    ]);
    const anchorRow = this.objectFrom(anchorPayload, ['message']);
    const assignmentByUid = new Map<string, DeskClientEntity>();
    if (assignment) assignmentByUid.set(uid, assignment.client);
    const anchor = this.toMessage({ ...anchorRow, uid: this.stringValue(anchorRow.uid) || uid }, clients, assignmentByUid);
    if (!anchor) throw new NotFoundException('Email message not found.');
    const clientAddress = anchor.from.address.trim().toLowerCase();
    if (!clientAddress || clientAddress === mailbox.address) throw new BadGatewayException('The selected email does not have a replyable client address.');

    const folders = this.collectionFrom(foldersPayload, ['folders', 'items']);
    const sentFolder = folders.find((candidate) => this.stringValue(candidate.specialUse ?? candidate.special_use).toLowerCase().includes('sent'));
    const sentPath = this.stringValue(sentFolder?.path) || 'INBOX.Sent';
    const folderPaths = [...new Set([folder, sentPath])];
    const collections = await Promise.all(folderPaths.map(async (path) => ({
      path,
      rows: this.collectionFrom(
        await this.hostingerRequest(`/mailboxes/${encodedMailbox}/folders/${encodeURIComponent(path)}/messages?page=1&perPage=50&sort=-uid`),
        ['messages', 'items']
      )
    })));
    const normalizedSubject = this.normalizeSubject(anchor.subject);
    const candidates = collections.flatMap((collection) => collection.rows.map((row) => ({ row, folder: collection.path })))
      .filter(({ row }) => {
        if (this.normalizeSubject(this.stringValue(row.subject)) !== normalizedSubject) return false;
        const from = this.addressList(row.from)[0]?.address.toLowerCase() ?? '';
        const recipients = this.addressList(row.to).map((address) => address.address.toLowerCase());
        return from === clientAddress || recipients.includes(clientAddress);
      })
      .sort((a, b) => this.dateValue(a.row.date ?? a.row.receivedAt) - this.dateValue(b.row.date ?? b.row.receivedAt))
      .slice(-20);

    const messages = await Promise.all(candidates.map(async ({ row, folder: messageFolder }) => {
      const messageUid = this.stringValue(row.uid ?? row.id);
      const textPayload = await this.hostingerRequest(
        `/mailboxes/${encodedMailbox}/folders/${encodeURIComponent(messageFolder)}/messages/${encodeURIComponent(messageUid)}/text`
      ).catch(() => null);
      const message = this.toMessage(row, clients, assignmentByUid);
      if (!message) return null;
      const from = message.from.address.toLowerCase();
      const originalBodyText = this.plainTextFrom(textPayload) || message.preview || 'This message does not include a plain-text body.';
      const cleanedBodyText = this.cleanReplyText(originalBodyText);
      return {
        ...message,
        folder: messageFolder,
        direction: from === mailbox.address ? 'outgoing' as const : 'incoming' as const,
        bodyText: cleanedBodyText.text,
        messageId: this.stringValue(row.messageId ?? row.message_id) || null,
        inReplyTo: this.stringValue(row.inReplyTo ?? row.in_reply_to) || null,
        attachments: this.attachmentsFrom(row.attachments),
        quotedHistoryHidden: cleanedBodyText.historyHidden
      };
    }));

    return {
      mailbox: mailbox.address,
      ticket: { ...anchor, to: this.addressList(anchorRow.to) },
      messages: messages.filter((message): message is DeskThreadMessage => message !== null)
    };
  }

  async replyToMessage(uid: string, text: string, folder = 'INBOX', files: Express.Multer.File[] = []): Promise<{ sent: true; sentAt: string }> {
    this.assertMessageUid(uid);
    const mailbox = await this.resolveMailbox();
    const anchorPayload = await this.hostingerRequest(
      `/mailboxes/${encodeURIComponent(mailbox.resourceId)}/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(uid)}`
    );
    const anchor = this.objectFrom(anchorPayload, ['message']);
    const recipient = this.addressList(anchor.from)[0]?.address.trim().toLowerCase();
    if (!recipient || recipient === mailbox.address) throw new BadGatewayException('The selected email does not have a replyable client address.');
    const subject = this.stringValue(anchor.subject) || '(No subject)';
    await this.hostingerRequest(`/mailboxes/${encodeURIComponent(mailbox.resourceId)}/send`, {
      method: 'POST',
      body: {
        to: [recipient],
        displayName: 'GIMO Laboratory Supplies',
        subject: /^re:/i.test(subject) ? subject : `Re: ${subject}`,
        text: text.trim(),
        ...(files.length ? { attachments: files.map((file) => ({
          filename: this.safeFilename(file.originalname),
          content: file.buffer.toString('base64'),
          contentType: file.mimetype,
          encoding: 'base64'
        })) } : {})
      }
    });
    return { sent: true, sentAt: new Date().toISOString() };
  }

  async getAttachment(uid: string, attachmentId: string, folder = 'INBOX'): Promise<DeskAttachment & { buffer: Buffer }> {
    this.assertMessageUid(uid);
    this.assertAttachmentId(attachmentId);
    const mailbox = await this.resolveMailbox();
    const basePath = `/mailboxes/${encodeURIComponent(mailbox.resourceId)}/folders/${encodeURIComponent(folder)}/messages/${encodeURIComponent(uid)}`;
    const messagePayload = await this.hostingerRequest(basePath);
    const row = this.objectFrom(messagePayload, ['message']);
    const metadata = this.attachmentsFrom(row.attachments).find((attachment) => attachment.id === attachmentId);
    if (!metadata) throw new NotFoundException('Email attachment not found.');
    if (metadata.sizeBytes > 15 * 1024 * 1024) throw new PayloadTooLargeException('This attachment is too large to preview or download in Desk.');
    const buffer = await this.hostingerBinaryRequest(`${basePath}/attachments/${encodeURIComponent(attachmentId)}`);
    if (buffer.length > 15 * 1024 * 1024) throw new PayloadTooLargeException('This attachment is too large to preview or download in Desk.');
    return { ...metadata, buffer };
  }

  async assignClient(uid: string, clientId: number | null | undefined, folder = 'INBOX'): Promise<{ client: DeskClientModel | null }> {
    this.assertMessageUid(uid);
    const mailbox = await this.resolveMailbox();
    const identity = { mailboxResourceId: mailbox.resourceId, folder, messageUid: uid };
    const existing = await this.assignments.findOneBy(identity);

    if (clientId == null) {
      if (existing) await this.assignments.remove(existing);
      return { client: null };
    }

    const client = await this.clients.findOneBy({ id: clientId });
    if (!client) throw new NotFoundException('Desk client not found.');
    await this.assignments.save(this.assignments.create({ ...existing, ...identity, clientId }));
    return { client: this.toClientModel(client) };
  }

  private async resolveMailbox(): Promise<{ resourceId: string; address: string }> {
    const expectedAddress = this.config.get<string>('HOSTINGER_MAILBOX_ADDRESS', 'sales@gimosupplies.com').trim().toLowerCase();
    const payload = await this.hostingerRequest('/me');
    const account = this.objectFrom(payload, ['account']);
    const candidates = this.collectionFrom(account, ['mailboxes', 'items']);
    const mailbox = candidates.find((candidate) => this.stringValue(candidate.address ?? candidate.email).toLowerCase() === expectedAddress);
    if (!mailbox) throw new ServiceUnavailableException(`The configured Desk mailbox (${expectedAddress}) is not available to this Agentic Mail token.`);
    const resourceId = this.stringValue(mailbox.resourceId ?? mailbox.resource_id ?? mailbox.id);
    if (!resourceId) throw new BadGatewayException('Hostinger Mail returned a mailbox without a resource ID.');
    return { resourceId, address: expectedAddress };
  }

  private async hostingerRequest(path: string, options: { method?: 'GET' | 'POST'; body?: JsonObject } = {}): Promise<unknown> {
    const token = this.config.get<string>('HOSTINGER_MAIL_API_TOKEN')?.trim();
    if (!token) throw new ServiceUnavailableException('Desk is not configured. Add HOSTINGER_MAIL_API_TOKEN to the server environment.');
    try {
      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        method: options.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.body ? { 'Content-Type': 'application/json' } : {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(12_000)
      });
      if (!response.ok) {
        this.logger.warn(`Hostinger Mail request failed with HTTP ${response.status} for ${path}`);
        if (response.status === 401 || response.status === 403) {
          throw new ServiceUnavailableException('Hostinger Agentic Mail rejected the configured token or mailbox scope.');
        }
        throw new BadGatewayException('Hostinger Mail could not complete the request.');
      }
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof BadGatewayException) throw error;
      this.logger.warn(`Hostinger Mail request could not be completed for ${path}`);
      throw new BadGatewayException('Hostinger Mail is temporarily unavailable.');
    }
  }

  private async hostingerBinaryRequest(path: string): Promise<Buffer> {
    const token = this.config.get<string>('HOSTINGER_MAIL_API_TOKEN')?.trim();
    if (!token) throw new ServiceUnavailableException('Desk is not configured. Add HOSTINGER_MAIL_API_TOKEN to the server environment.');
    try {
      const response = await fetch(`${this.apiBaseUrl}${path}`, {
        headers: { Accept: 'application/octet-stream', Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(20_000)
      });
      if (!response.ok) {
        this.logger.warn(`Hostinger Mail attachment request failed with HTTP ${response.status} for ${path}`);
        if (response.status === 401 || response.status === 403) throw new ServiceUnavailableException('Hostinger Agentic Mail rejected the configured token or mailbox scope.');
        if (response.status === 404) throw new NotFoundException('Email attachment not found.');
        throw new BadGatewayException('Hostinger Mail could not download the attachment.');
      }
      const contentLength = Number(response.headers.get('content-length') || 0);
      if (contentLength > 15 * 1024 * 1024) throw new PayloadTooLargeException('This attachment is too large to preview or download in Desk.');
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (error instanceof ServiceUnavailableException || error instanceof BadGatewayException || error instanceof NotFoundException || error instanceof PayloadTooLargeException) throw error;
      this.logger.warn(`Hostinger Mail attachment request could not be completed for ${path}`);
      throw new BadGatewayException('Hostinger Mail is temporarily unavailable.');
    }
  }

  private toMessage(row: JsonObject, clients: DeskClientEntity[], assignmentByUid: Map<string, DeskClientEntity>): DeskMessage | null {
    const uid = this.stringValue(row.uid ?? row.id ?? row.messageUid ?? row.message_id);
    if (!uid) return null;
    const from = this.addressList(row.from ?? row.sender)[0] ?? { name: null, address: '' };
    const assignedClient = assignmentByUid.get(uid);
    const ruleClient = assignedClient ? null : this.matchClient(from.address, clients);
    const flags = Array.isArray(row.flags) ? row.flags.map((flag) => this.stringValue(flag).toLowerCase()) : [];
    const attachments = row.attachments;
    return {
      uid,
      subject: this.stringValue(row.subject) || '(No subject)',
      from,
      receivedAt: this.stringValue(row.receivedAt ?? row.received_at ?? row.date ?? row.createdAt) || null,
      preview: this.stringValue(row.preview ?? row.snippet ?? row.textPreview ?? row.text_preview).slice(0, 280),
      unread: typeof row.unseen === 'boolean' ? row.unseen : typeof row.unread === 'boolean' ? row.unread : !flags.includes('\\seen') && !flags.includes('seen'),
      hasAttachments: Array.isArray(attachments) ? attachments.length > 0 : Boolean(row.hasAttachments ?? row.has_attachments),
      client: assignedClient ? this.toClientModel(assignedClient) : ruleClient ? this.toClientModel(ruleClient) : null,
      assignmentSource: assignedClient ? 'manual' : ruleClient ? 'rule' : null
    };
  }

  private matchClient(address: string, clients: DeskClientEntity[]): DeskClientEntity | null {
    const normalized = address.trim().toLowerCase();
    const domain = normalized.split('@')[1] ?? '';
    return clients.find((client) => client.emailAddress === normalized) ?? clients.find((client) => client.emailDomain === domain) ?? null;
  }

  private addressList(value: unknown): MailAddress[] {
    const values = Array.isArray(value) ? value : value == null ? [] : [value];
    return values.map((entry) => {
      if (typeof entry === 'string') {
        const match = entry.match(/^(.*?)\s*<([^>]+)>$/);
        return match ? { name: match[1].trim().replace(/^"|"$/g, '') || null, address: match[2].trim() } : { name: null, address: entry.trim() };
      }
      if (this.isObject(entry)) return {
        name: this.stringValue(entry.name ?? entry.displayName ?? entry.display_name) || null,
        address: this.stringValue(entry.address ?? entry.email)
      };
      return { name: null, address: '' };
    }).filter((address) => address.address);
  }

  private collectionFrom(payload: unknown, keys: string[]): JsonObject[] {
    const data = this.isObject(payload) && 'data' in payload ? payload.data : payload;
    if (Array.isArray(data)) return data.filter((item): item is JsonObject => this.isObject(item));
    if (!this.isObject(data)) return [];
    for (const key of keys) {
      const value = data[key];
      if (Array.isArray(value)) return value.filter((item): item is JsonObject => this.isObject(item));
    }
    return [];
  }

  private objectFrom(payload: unknown, keys: string[]): JsonObject {
    const data = this.isObject(payload) && 'data' in payload ? payload.data : payload;
    if (!this.isObject(data)) return {};
    for (const key of keys) if (this.isObject(data[key])) return data[key];
    return data;
  }

  private plainTextFrom(payload: unknown): string {
    const data = this.isObject(payload) && 'data' in payload ? payload.data : payload;
    if (typeof data === 'string') return data;
    if (!this.isObject(data)) return '';
    for (const key of ['text', 'plain', 'body']) {
      const value = this.stringValue(data[key]);
      if (value) return value;
    }
    for (const key of ['message', 'content']) {
      if (this.isObject(data[key])) {
        const nested = data[key];
        const value = this.stringValue(nested.text ?? nested.plain ?? nested.body);
        if (value) return value;
      }
    }
    return '';
  }

  private cleanReplyText(value: string): { text: string; historyHidden: boolean } {
    const original = value.replace(/\r\n?/g, '\n').trim();
    if (!original) return { text: value, historyHidden: false };
    const lines = original.split('\n');
    let cutAt = -1;

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      if (/^-{2,}\s*Original Message\s*-{2,}$/i.test(line)) {
        cutAt = index;
        break;
      }
      if (/^On\s.+/i.test(line)) {
        for (let end = index + 1; end <= Math.min(index + 4, lines.length); end += 1) {
          const replyHeader = lines.slice(index, end).join(' ').replace(/\s+/g, ' ');
          if (/\bwrote:\s*$/i.test(replyHeader)) {
            cutAt = index;
            break;
          }
        }
        if (cutAt >= 0) break;
      }
      if (/^From:\s*.+/i.test(line)) {
        const headerBlock = lines.slice(index, Math.min(index + 7, lines.length)).join('\n');
        if (/^(Sent|Date):\s*.+/im.test(headerBlock) && /^To:\s*.+/im.test(headerBlock) && /^Subject:\s*.+/im.test(headerBlock)) {
          cutAt = index;
          break;
        }
      }
    }

    if (cutAt < 0) {
      const firstQuotedLine = lines.findIndex((line) => /^\s*>/.test(line));
      if (firstQuotedLine >= 0 && lines.slice(firstQuotedLine).every((line) => !line.trim() || /^\s*>/.test(line))) cutAt = firstQuotedLine;
    }

    if (cutAt <= 0) return { text: original, historyHidden: false };
    const cleaned = lines.slice(0, cutAt).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return cleaned ? { text: cleaned, historyHidden: true } : { text: original, historyHidden: false };
  }

  private attachmentsFrom(value: unknown): DeskAttachment[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is JsonObject => this.isObject(item)).map((item) => {
      const id = this.stringValue(item.id ?? item.attachmentId ?? item.attachment_id);
      const contentType = this.stringValue(item.contentType ?? item.content_type ?? item.mimeType ?? item.mime_type).toLowerCase() || 'application/octet-stream';
      const filename = this.safeFilename(this.stringValue(item.filename ?? item.name) || `attachment-${id || 'file'}`);
      return {
        id,
        filename,
        contentType,
        sizeBytes: Number(item.sizeBytes ?? item.size_bytes ?? item.size ?? 0) || 0,
        inline: Boolean(item.inline),
        previewable: /^(image\/(jpeg|png|webp|gif)|application\/pdf|text\/(plain|csv))$/.test(contentType)
      };
    }).filter((attachment) => attachment.id);
  }

  private safeFilename(value: string): string {
    const cleaned = value.replace(/\\/g, '/').split('/').pop()?.replace(/[\u0000-\u001f\u007f]/g, '').trim();
    return (cleaned || 'attachment').slice(0, 180);
  }

  private toClientModel(client: DeskClientEntity): DeskClientModel {
    return { id: client.id, name: client.name, emailAddress: client.emailAddress, emailDomain: client.emailDomain };
  }

  private normalizeSubject(subject: string): string {
    return subject.replace(/^\s*((re|fw|fwd)\s*:\s*)+/i, '').trim().toLowerCase();
  }

  private dateValue(value: unknown): number {
    const parsed = Date.parse(this.stringValue(value));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private assertMessageUid(uid: string): void {
    if (!uid || uid.length > 160 || /[\u0000-\u001f]/.test(uid)) throw new NotFoundException('Email message not found.');
  }

  private assertAttachmentId(id: string): void {
    if (!id || id.length > 160 || /[\u0000-\u001f]/.test(id)) throw new NotFoundException('Email attachment not found.');
  }

  private isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }
}
