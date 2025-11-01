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
    port: number;
    secure: boolean;
    requireTLS: boolean;
  };
}

const DEFAULT_FROM_NAME = 'Banco de Alimentos';

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value === 'undefined') {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

export function loadEmailConfig(): ResolvedEmailConfig {
  const provider = (process.env.EMAIL_PROVIDER ?? 'gmail') as SupportedEmailProvider;

  if (provider !== 'gmail') {
    throw new Error(`Proveedor de correo no soportado: ${provider}`);
  }

  const suppressSend = process.env.EMAIL_SUPPRESS_SEND === 'true';
  const logOnly = process.env.EMAIL_LOG_ONLY === 'true';
  const gmailUser = process.env.EMAIL_GMAIL_USER ?? '';
  const gmailPass = process.env.EMAIL_GMAIL_PASS ?? '';

  const parsedPort = Number(process.env.EMAIL_GMAIL_PORT ?? '465');
  const gmailPort = Number.isInteger(parsedPort) ? parsedPort : 465;

  const secureEnv = process.env.EMAIL_GMAIL_SECURE;
  const requireTLSEnv = process.env.EMAIL_GMAIL_REQUIRE_TLS;

  const gmailSecure =
    typeof secureEnv === 'undefined'
      ? gmailPort === 465
      : parseBoolean(secureEnv, gmailPort === 465);

  const gmailRequireTLS =
    typeof requireTLSEnv === 'undefined'
      ? gmailPort === 587
      : parseBoolean(requireTLSEnv, gmailPort === 587);

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
      port: gmailPort,
      secure: gmailSecure,
      requireTLS: gmailRequireTLS,
    },
  };
}
