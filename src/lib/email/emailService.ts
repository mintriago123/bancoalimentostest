import 'server-only';

import { loadEmailConfig } from './config';
import { EmailOptions, EmailProvider } from './types';
import { GmailEmailProvider } from './providers/GmailEmailProvider';

let providerInstance: EmailProvider | null = null;
let suppressMessageShown = false;
let logOnlyMessageShown = false;

function ensureProvider(): EmailProvider {
  const config = loadEmailConfig();

  if (!providerInstance) {
    switch (config.provider) {
      case 'gmail':
        providerInstance = new GmailEmailProvider(config);
        break;
      default:
        throw new Error(`Proveedor de correo no soportado: ${config.provider}`);
    }
  }

  return providerInstance;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const config = loadEmailConfig();

  if (config.suppressSend) {
    if (!suppressMessageShown) {
      console.warn('[email] EMAIL_SUPPRESS_SEND=true: los correos no se enviarán (modo silencio).');
      suppressMessageShown = true;
    }

    console.log('[email] Envío de correo suprimido:', {
      to: options.to,
      subject: options.subject,
    });
    return;
  }

  if (config.logOnly) {
    if (!logOnlyMessageShown) {
      console.warn('[email] EMAIL_LOG_ONLY=true: los correos se registrarán pero se intentará el envío.');
      logOnlyMessageShown = true;
    }
    console.log('[email] Envío de correo (modo log):', {
      to: options.to,
      subject: options.subject,
    });
  }

  const provider = ensureProvider();
  await provider.sendEmail(options);
}
