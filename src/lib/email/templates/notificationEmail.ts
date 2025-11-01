interface NotificationEmailTemplateInput {
  titulo: string;
  mensaje: string;
  categoria?: string | null;
  urlAccion?: string | null;
  destinatarioNombre?: string | null;
}

function normalizeCategoria(categoria?: string | null) {
  if (!categoria) return 'Sistema';
  const lower = categoria.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildNotificationEmailTemplate({
  titulo,
  mensaje,
  categoria,
  urlAccion,
  destinatarioNombre,
}: NotificationEmailTemplateInput) {
  const normalizedCategoria = normalizeCategoria(categoria);
  const safeTitulo = escapeHtml(titulo);
  const safeMensaje = escapeHtml(mensaje).replace(/\n/g, '<br />');
  const greeting = destinatarioNombre ? `Hola ${escapeHtml(destinatarioNombre)},` : 'Hola,';

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px;">
        <h2 style="margin-bottom: 12px; font-size: 20px; color: #dc2626;">${safeTitulo}</h2>
        <p style="margin-bottom: 16px; font-size: 14px; color: #6b7280;">Categoria: ${normalizedCategoria}</p>
        <p style="margin-bottom: 16px; font-size: 15px; color: #111827;">${greeting}</p>
        <p style="margin-bottom: 24px; font-size: 15px; color: #111827;">${safeMensaje}</p>
        ${
          urlAccion
            ? `<a href="${urlAccion}" style="display: inline-block; padding: 12px 24px; border-radius: 8px; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: 600;">Ver detalle</a>`
            : ''
        }
        <p style="margin-top: 32px; font-size: 13px; color: #6b7280;">
          Este mensaje fue generado automaticamente por la plataforma Banco de Alimentos.
        </p>
      </div>
    </div>
  `;

  const textLines = [
    titulo,
    '',
    `Categoria: ${normalizedCategoria}`,
    '',
    greeting,
    '',
    mensaje,
  ];

  if (urlAccion) {
    textLines.push('', `Ver detalle: ${urlAccion}`);
  }

  textLines.push('', 'Este mensaje fue generado automaticamente por la plataforma Banco de Alimentos.');

  const text = textLines.join('\n');
  const subject = `${titulo}`;

  return { subject, html, text };
}
