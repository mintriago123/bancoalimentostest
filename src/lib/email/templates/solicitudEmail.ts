/**
 * @fileoverview Template de email para notificaciones de solicitudes con comprobante QR
 */

import type { DatosComprobante } from '@/lib/comprobante/types';
import { formatearFecha, formatearFechaSolo } from '@/lib/comprobante/comprobanteService';

interface SolicitudEmailTemplateInput {
  estado: 'aprobada' | 'rechazada' | 'entregada';
  comprobante: DatosComprobante;
  qrImageBase64: string;
  baseUrl: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildSolicitudAprobadaEmailTemplate({
  comprobante,
  qrImageBase64,
  baseUrl
}: Omit<SolicitudEmailTemplateInput, 'estado'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, codigoComprobante, fechaEmision, fechaVencimiento, instrucciones, descripcionProyecto } = comprobante;

  const subject = `✅ Solicitud Aprobada - Código: ${codigoComprobante}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud Aprobada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #26dc3b 0%, #1cb933 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ¡Solicitud Aprobada!
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Banco de Alimentos - Sistema de Gestión
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px;">
              <p style="margin: 0; font-size: 16px; color: #374151;">
                Estimado/a <strong style="color: #1f2937;">${escapeHtml(usuario.nombre)}</strong>,
              </p>
              <p style="margin: 16px 0 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                Nos complace informarle que su solicitud de alimentos ha sido <strong style="color: #059669;">aprobada</strong>. 
                A continuación, encontrará los detalles de su pedido y las instrucciones para el retiro.
              </p>
            </td>
          </tr>

          <!-- Comprobante Code -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">
                  Código de Comprobante
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #78350f; font-family: 'Courier New', monospace;">
                  ${escapeHtml(codigoComprobante)}
                </p>
              </div>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Detalles del Pedido
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Producto:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(pedido.tipoAlimento)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Cantidad:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${pedido.cantidad} ${escapeHtml(pedido.unidad)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Solicitud:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${formatearFecha(pedido.fechaCreacion)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Aprobación:</td>
                  <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">${formatearFecha(fechaEmision)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Válido hasta:</td>
                  <td style="padding: 8px 0; color: #dc2626; font-size: 14px; font-weight: 600;">${formatearFechaSolo(fechaVencimiento)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR Code Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #374151;">
                  Código QR del Comprobante
                </h3>
                <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280;">
                  Presente este código al operador para generar su comprobante de entrega
                </p>
                <img src="${qrImageBase64}" alt="Código QR del comprobante" style="width: 180px; height: 180px; border-radius: 8px; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              </div>
            </td>
          </tr>

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Instrucciones para el Retiro
              </h2>
              <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                ${instrucciones.map(inst => `<li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">${escapeHtml(inst)}</li>`).join('')}
              </ol>
            </td>
          </tr>

          <!-- User Data -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Sus Datos Registrados
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; width: 35%;">Nombre:</td>
                  <td style="padding: 12px 16px; color: #1f2937; font-size: 14px;">${escapeHtml(usuario.nombre)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Email:</td>
                  <td style="padding: 12px 16px; color: #1f2937; font-size: 14px; border-top: 1px solid #e5e7eb;">${escapeHtml(usuario.email)}</td>
                </tr>
                ${usuario.telefono ? `
                <tr>
                  <td style="padding: 12px 16px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">Teléfono:</td>
                  <td style="padding: 12px 16px; color: #1f2937; font-size: 14px; border-top: 1px solid #e5e7eb;">${escapeHtml(usuario.telefono)}</td>
                </tr>
                ` : ''}
              </table>
            </td>
          </tr>

          <!-- About Project -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #fef2f2; border-left: 4px solid #264edc; border-radius: 0 8px 8px 0; padding: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; color: #1b5a99;">
                  Sobre el Banco de Alimentos
                </h3>
                <p style="margin: 0; font-size: 13px; color: #1d477f; line-height: 1.6;">
                  ${escapeHtml(descripcionProyecto)}
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${baseUrl}/user/solicitudes" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                Ver mis Solicitudes
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-align: center;">
                Este es un mensaje automático del sistema Banco de Alimentos. Por favor, no responda a este correo.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
SOLICITUD APROBADA - BANCO DE ALIMENTOS
========================================

Estimado/a ${usuario.nombre},

Nos complace informarle que su solicitud de alimentos ha sido APROBADA.

CÓDIGO DE COMPROBANTE: ${codigoComprobante}

DETALLES DEL PEDIDO:
- Producto: ${pedido.tipoAlimento}
- Cantidad: ${pedido.cantidad} ${pedido.unidad}
- Fecha de Solicitud: ${formatearFecha(pedido.fechaCreacion)}
- Fecha de Aprobación: ${formatearFecha(fechaEmision)}
- Válido hasta: ${formatearFechaSolo(fechaVencimiento)}

INSTRUCCIONES PARA EL RETIRO:
${instrucciones.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

SUS DATOS REGISTRADOS:
- Nombre: ${usuario.nombre}
- Email: ${usuario.email}
${usuario.telefono ? `- Teléfono: ${usuario.telefono}` : ''}

SOBRE EL BANCO DE ALIMENTOS:
${descripcionProyecto}

Para ver sus solicitudes, visite: ${baseUrl}/user/solicitudes

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}

export function buildSolicitudRechazadaEmailTemplate({
  comprobante,
  baseUrl
}: Omit<SolicitudEmailTemplateInput, 'estado' | 'qrImageBase64'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, fechaEmision } = comprobante;
  const comentario = pedido.comentarioAdmin;

  const subject = `Solicitud No Aprobada - Banco de Alimentos`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud No Aprobada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Solicitud No Aprobada
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Banco de Alimentos - Sistema de Gestión
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 32px 16px;">
              <p style="margin: 0; font-size: 16px; color: #374151;">
                Estimado/a <strong style="color: #1f2937;">${escapeHtml(usuario.nombre)}</strong>,
              </p>
              <p style="margin: 16px 0 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                Lamentamos informarle que su solicitud de alimentos no ha podido ser aprobada en esta ocasión. 
                A continuación, encontrará los detalles y la razón de esta decisión.
              </p>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Detalles de la Solicitud
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Producto solicitado:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(pedido.tipoAlimento)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Cantidad:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${pedido.cantidad} ${escapeHtml(pedido.unidad)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Solicitud:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${formatearFecha(pedido.fechaCreacion)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Respuesta:</td>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${formatearFecha(fechaEmision)}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${comentario ? `
          <!-- Admin Comment -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 12px; font-size: 15px; color: #991b1b;">
                  Comentario del Administrador
                </h3>
                <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; font-style: italic;">
                  "${escapeHtml(comentario)}"
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- What to do next -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                🔄 ¿Qué puede hacer ahora?
              </h2>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  <strong>Revisar los requisitos:</strong> Asegúrese de cumplir con los criterios de elegibilidad para recibir ayuda.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  <strong>Realizar una nueva solicitud:</strong> Puede intentar con un tipo de alimento diferente o una cantidad menor.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  <strong>Contactarnos:</strong> Si tiene dudas sobre el rechazo, no dude en comunicarse con nosotros.
                </li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${baseUrl}/user/formulario" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                Realizar Nueva Solicitud
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-align: center;">
                Este es un mensaje automático del sistema Banco de Alimentos. Por favor, no responda a este correo.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
SOLICITUD NO APROBADA - BANCO DE ALIMENTOS
==========================================

Estimado/a ${usuario.nombre},

Lamentamos informarle que su solicitud de alimentos no ha podido ser aprobada en esta ocasión.
DETALLES DE LA SOLICITUD:
- Producto solicitado: ${pedido.tipoAlimento}
- Cantidad: ${pedido.cantidad} ${pedido.unidad}
- Fecha de Solicitud: ${formatearFecha(pedido.fechaCreacion)}
- Fecha de Respuesta: ${formatearFecha(fechaEmision)}

${comentario ? `COMENTARIO DEL ADMINISTRADOR:\n"${comentario}"\n` : ''}

¿QUÉ PUEDE HACER AHORA?
1. Revisar los requisitos: Asegúrese de cumplir con los criterios de elegibilidad.
2. Realizar una nueva solicitud: Puede intentar con un tipo de alimento diferente.
3. Contactarnos: Si tiene dudas sobre el rechazo, comuníquese con nosotros.

Para realizar una nueva solicitud, visite: ${baseUrl}/user/formulario

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}

// Plantilla de email para solicitud entregada
export function buildSolicitudEntregadaEmailTemplate({
  comprobante,
  qrImageBase64,
  baseUrl
}: Omit<SolicitudEmailTemplateInput, 'estado'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, codigoComprobante, fechaEmision, descripcionProyecto } = comprobante;

  const subject = `🎉 Solicitud Entregada`;
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Solicitud Entregada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Solicitud Entregada
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                Banco de Alimentos - Sistema de Gestión
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 16px;">
              <p style="margin: 0; font-size: 16px; color: #374151;">
                Estimado/a <strong style="color: #1f2937;">${escapeHtml(usuario.nombre)}</strong>,
              </p>
              <p style="margin: 16px 0 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                Le confirmamos que su solicitud ha sido <strong style="color: #059669;">entregada exitosamente</strong> el día <strong>${formatearFecha(fechaEmision)}</strong>.
              </p>
              <p style="margin: 24px 0 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                ¡Gracias por confiar en el Banco de Alimentos! Si tienes dudas o necesitas realizar una nueva solicitud, puedes hacerlo desde la plataforma.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${baseUrl}/user/solicitudes" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
                Ver mis Solicitudes
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-align: center;">
                Este es un mensaje automático del sistema Banco de Alimentos. Por favor, no responda a este correo.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                © ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
SOLICITUD ENTREGADA - BANCO DE ALIMENTOS
========================================

Estimado/a ${usuario.nombre},

Te confirmamos que tu solicitud ha sido ENTREGADA exitosamente el día ${formatearFecha(fechaEmision)}.

¡Gracias por confiar en el Banco de Alimentos!

Para ver tus solicitudes, visita: ${baseUrl}/user/solicitudes

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}
