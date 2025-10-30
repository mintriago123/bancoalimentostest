import 'server-only';

export type SupportedEmailProvider = 'gmail';

export interface ResolvedEmailConfig {
  provider: SupportedEmailProvider;
  defaultFromEmail: string;
  defaultFromName: string;
  suppressSend: boolean;
  logOnly: boolean;
  gmail: {
    user: string;
    pass: string;
  };
}

const DEFAULT_FROM_NAME = 'Banco de Alimentos';

export function loadEmailConfig(): ResolvedEmailConfig {
  const provider = (process.env.EMAIL_PROVIDER ?? 'gmail') as SupportedEmailProvider;

  if (provider !== 'gmail') {
    throw new Error(`Proveedor de correo no soportado: ${provider}`);
  }

  const suppressSend = process.env.EMAIL_SUPPRESS_SEND === 'true';
  const logOnly = process.env.EMAIL_LOG_ONLY === 'true';
  const gmailUser = process.env.EMAIL_GMAIL_USER ?? '';
  const gmailPass = process.env.EMAIL_GMAIL_PASS ?? '';

  if ((!gmailUser || !gmailPass) && !suppressSend) {
    throw new Error('Faltan las variables EMAIL_GMAIL_USER o EMAIL_GMAIL_PASS para enviar correos con Gmail.');
  }

  const defaultFromEmail = process.env.EMAIL_FROM_ADDRESS ?? (gmailUser || 'no-reply@example.com');
  const defaultFromName = process.env.EMAIL_FROM_NAME ?? DEFAULT_FROM_NAME;

  return {
    provider,
    defaultFromEmail,
    defaultFromName,
    suppressSend,
    logOnly,
    gmail: {
      user: gmailUser,
      pass: gmailPass,
    },
  };
}
