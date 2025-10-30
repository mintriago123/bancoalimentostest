export type Recipient = string | string[];

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
  contentType?: string;
}

export interface EmailOptions {
  to: Recipient;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: Recipient;
  bcc?: Recipient;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}
