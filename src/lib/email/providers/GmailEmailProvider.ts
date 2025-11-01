import 'server-only';

import nodemailer, { Transporter } from 'nodemailer';
import { EmailOptions, EmailProvider, Recipient } from '../types';
import { ResolvedEmailConfig } from '../config';

function normalizeRecipient(recipient?: Recipient): string | undefined {
  if (!recipient) return undefined;
  return Array.isArray(recipient) ? recipient.join(',') : recipient;
}

export class GmailEmailProvider implements EmailProvider {
  private transporter: Transporter;
  private readonly defaultFrom: string;
  private readonly config: ResolvedEmailConfig;

  constructor(config: ResolvedEmailConfig) {
    this.config = config;
    this.defaultFrom = `"${config.defaultFromName}" <${config.defaultFromEmail}>`;

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: config.gmail.port,
      secure: config.gmail.secure,
      requireTLS: config.gmail.requireTLS,
      auth: {
        user: config.gmail.user,
        pass: config.gmail.pass,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const to = normalizeRecipient(options.to);
    if (!to) {
      throw new Error('El campo "to" es obligatorio para enviar un correo.');
    }

    await this.transporter.sendMail({
      to,
      from: options.from ?? this.defaultFrom,
      subject: options.subject,
      html: options.html,
      text: options.text,
      cc: normalizeRecipient(options.cc),
      bcc: normalizeRecipient(options.bcc),
      replyTo: options.replyTo,
      headers: options.headers,
      attachments: options.attachments,
    });
  }
}
