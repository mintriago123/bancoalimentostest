/**
 * @fileoverview Template de email para notificaciones de donaciones con comprobante QR
 */

import type { DatosComprobante } from '@/lib/comprobante/types';
import { formatearFecha, formatearFechaSolo } from '@/lib/comprobante/comprobanteService';

interface DonacionEmailTemplateInput {
  estado: 'Recogida' | 'Entregada' | 'Cancelada';
  comprobante: DatosComprobante;
  qrImageBase64?: string;
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

export function buildDonacionAprobadaEmailTemplate({
  comprobante,
  qrImageBase64,
  baseUrl
}: Omit<DonacionEmailTemplateInput, 'estado'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, codigoComprobante, fechaEmision, instrucciones, descripcionProyecto } = comprobante;

  const subject = `Donación Confirmada - Código: ${codigoComprobante}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donación Confirmada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ¡Gracias por tu Donación!
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
                Su generosa donación ha sido <strong style="color: #059669;">registrada exitosamente</strong> en nuestro sistema. 
                Gracias a personas como usted, podemos seguir ayudando a quienes más lo necesitan.
              </p>
            </td>
          </tr>

          <!-- Comprobante Code -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="background-color: #d1fae5; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #065f46; text-transform: uppercase; letter-spacing: 1px;">
                  Código de Comprobante
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #064e3b; font-family: 'Courier New', monospace;">
                  ${escapeHtml(codigoComprobante)}
                </p>
              </div>
            </td>
          </tr>

          <!-- Donation Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Detalles de la Donación
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
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Registro:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${formatearFecha(pedido.fechaCreacion)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Estado:</td>
                  <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">
                    <span style="display: inline-block; background-color: #d1fae5; padding: 4px 12px; border-radius: 12px;">
                      ✓ Confirmada
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${qrImageBase64 ? `
          <!-- QR Code Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #374151;">
                  Código QR del Comprobante
                </h3>
                <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280;">
                  Presente este código al momento de la recolección para generar su comprobante
                </p>
                <img src="${qrImageBase64}" alt="Código QR del comprobante" style="width: 180px; height: 180px; border-radius: 8px; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Instructions -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Próximos Pasos
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
                Datos del Donante
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

          <!-- Impact Message -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0 8px 8px 0; padding: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; color: #065f46;">
                  Su Impacto
                </h3>
                <p style="margin: 0; font-size: 13px; color: #047857; line-height: 1.6;">
                  Gracias a su donación de <strong>${pedido.cantidad} ${escapeHtml(pedido.unidad)}</strong> de <strong>${escapeHtml(pedido.tipoAlimento)}</strong>, 
                  podremos ayudar a familias en situación de vulnerabilidad alimentaria. ¡Su generosidad hace la diferencia!
                </p>
              </div>
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
              <a href="${baseUrl}/donante/donaciones" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3);">
                Ver mis Donaciones
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
DONACIÓN CONFIRMADA - BANCO DE ALIMENTOS
========================================

Estimado/a ${usuario.nombre},

¡Gracias por su generosa donación! Su aporte ha sido registrado exitosamente en nuestro sistema.

CÓDIGO DE COMPROBANTE: ${codigoComprobante}

DETALLES DE LA DONACIÓN:
- Producto: ${pedido.tipoAlimento}
- Cantidad: ${pedido.cantidad} ${pedido.unidad}
- Fecha de Registro: ${formatearFecha(pedido.fechaCreacion)}
- Estado: Confirmada

PRÓXIMOS PASOS:
${instrucciones.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

DATOS DEL DONANTE:
- Nombre: ${usuario.nombre}
- Email: ${usuario.email}
${usuario.telefono ? `- Teléfono: ${usuario.telefono}` : ''}

SU IMPACTO:
Gracias a su donación de ${pedido.cantidad} ${pedido.unidad} de ${pedido.tipoAlimento}, 
podremos ayudar a familias en situación de vulnerabilidad alimentaria.

SOBRE EL BANCO DE ALIMENTOS:
${descripcionProyecto}

Para ver sus donaciones, visite: ${baseUrl}/donante/donaciones

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}

export function buildDonacionRecogidaEmailTemplate({
  comprobante,
  qrImageBase64,
  baseUrl
}: Omit<DonacionEmailTemplateInput, 'estado'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, codigoComprobante, fechaEmision } = comprobante;

  const subject = `🚚 Donación Recogida - Código: ${codigoComprobante}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donación Recogida</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Donación Recogida
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
                Le informamos que su donación ha sido <strong style="color: #2563eb;">recogida exitosamente</strong> por nuestro equipo de recolección. 
                Los alimentos se encuentran en camino a nuestras instalaciones para ser procesados y distribuidos.
              </p>
            </td>
          </tr>

          <!-- Comprobante Code -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="background-color: #dbeafe; border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #1e40af; text-transform: uppercase; letter-spacing: 1px;">
                  Código de Comprobante
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1e3a8a; font-family: 'Courier New', monospace;">
                  ${escapeHtml(codigoComprobante)}
                </p>
              </div>
            </td>
          </tr>

          <!-- Donation Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Detalles de la Donación Recogida
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
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Recolección:</td>
                  <td style="padding: 8px 0; color: #2563eb; font-size: 14px; font-weight: 600;">${formatearFecha(fechaEmision)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Estado:</td>
                  <td style="padding: 8px 0; color: #2563eb; font-size: 14px; font-weight: 600;">
                    <span style="display: inline-block; background-color: #dbeafe; padding: 4px 12px; border-radius: 12px;">
                      En tránsito
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${qrImageBase64 ? `
          <!-- QR Code Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #374151;">
                  Código QR de Seguimiento
                </h3>
                <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280;">
                  Conserve este código para consultar el estado de su donación
                </p>
                <img src="${qrImageBase64}" alt="Código QR del comprobante" style="width: 180px; height: 180px; border-radius: 8px; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- What happens next -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                ¿Qué sigue ahora?
              </h2>
              <ol style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  Los alimentos serán <strong>inspeccionados y clasificados</strong> en nuestras instalaciones.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  Se <strong>registrarán en el inventario</strong> del Banco de Alimentos.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  Serán <strong>distribuidos a familias</strong> que los necesitan.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  Recibirá una <strong>notificación final</strong> cuando la donación sea procesada completamente.
                </li>
              </ol>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${baseUrl}/donante/donaciones" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
                Seguir mi Donación
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
DONACIÓN RECOGIDA - BANCO DE ALIMENTOS
======================================

Estimado/a ${usuario.nombre},

Le informamos que su donación ha sido RECOGIDA exitosamente por nuestro equipo.

CÓDIGO DE COMPROBANTE: ${codigoComprobante}

DETALLES DE LA DONACIÓN:
- Producto: ${pedido.tipoAlimento}
- Cantidad: ${pedido.cantidad} ${pedido.unidad}
- Fecha de Recolección: ${formatearFecha(fechaEmision)}
- Estado: En tránsito

¿QUÉ SIGUE AHORA?
1. Los alimentos serán inspeccionados y clasificados.
2. Se registrarán en el inventario del Banco de Alimentos.
3. Serán distribuidos a familias que los necesitan.
4. Recibirá una notificación cuando la donación sea procesada.

Para seguir su donación, visite: ${baseUrl}/donante/donaciones

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}

export function buildDonacionEntregadaEmailTemplate({
  comprobante,
  qrImageBase64,
  baseUrl
}: Omit<DonacionEmailTemplateInput, 'estado'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, codigoComprobante, fechaEmision, descripcionProyecto } = comprobante;

  const subject = `✅ Donación Procesada - ¡Gracias! - Código: ${codigoComprobante}`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donación Procesada</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Donación Procesada
              </h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                ¡Su aporte ya está ayudando a familias!
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
                Nos complace informarle que su donación ha sido <strong style="color: #059669;">procesada exitosamente</strong> 
                e incorporada a nuestro inventario. Los alimentos ya están siendo distribuidos a quienes más los necesitan.
              </p>
            </td>
          </tr>

          <!-- Comprobante Code -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="background-color: #d1fae5; border: 2px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #065f46; text-transform: uppercase; letter-spacing: 1px;">
                  Código de Comprobante Final
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: #064e3b; font-family: 'Courier New', monospace;">
                  ${escapeHtml(codigoComprobante)}
                </p>
                <p style="margin: 8px 0 0; font-size: 12px; color: #065f46;">
                  Conserve este código para sus registros fiscales
                </p>
              </div>
            </td>
          </tr>

          <!-- Donation Summary -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Resumen de la Donación
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 40%;">Producto donado:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(pedido.tipoAlimento)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Cantidad:</td>
                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${pedido.cantidad} ${escapeHtml(pedido.unidad)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Procesamiento:</td>
                  <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">${formatearFecha(fechaEmision)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Estado Final:</td>
                  <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">
                    <span style="display: inline-block; background-color: #d1fae5; padding: 4px 12px; border-radius: 12px;">
                      ✓ Completada
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${qrImageBase64 ? `
          <!-- QR Code Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; font-size: 16px; color: #374151;">
                  📱 Comprobante Digital
                </h3>
                <p style="margin: 0 0 16px; font-size: 13px; color: #6b7280;">
                  Escanee para acceder a su comprobante completo
                </p>
                <img src="${qrImageBase64}" alt="Código QR del comprobante" style="width: 180px; height: 180px; border-radius: 8px; border: 4px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Thank you message -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 24px; text-align: center;">
                <h3 style="margin: 0 0 12px; font-size: 20px; color: #065f46;">
                  ¡Gracias por su Generosidad!
                </h3>
                <p style="margin: 0; font-size: 14px; color: #047857; line-height: 1.6;">
                  Su donación de <strong>${pedido.cantidad} ${escapeHtml(pedido.unidad)}</strong> de <strong>${escapeHtml(pedido.tipoAlimento)}</strong> 
                  está haciendo una diferencia real en la vida de familias que lo necesitan. 
                  Gracias por ser parte de nuestra misión de combatir el hambre.
                </p>
              </div>
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

          <!-- CTA Buttons -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${baseUrl}/donante/nueva-donacion" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.3); margin-right: 12px;">
                Realizar otra Donación
              </a>
              <a href="${baseUrl}/donante/donaciones" style="display: inline-block; padding: 14px 32px; background: #ffffff; color: #059669; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; border: 2px solid #059669; margin-top: 12px;">
                Ver Historial
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
DONACIÓN PROCESADA - BANCO DE ALIMENTOS
=======================================

Estimado/a ${usuario.nombre},

¡GRACIAS! Su donación ha sido procesada exitosamente e incorporada a nuestro inventario.

CÓDIGO DE COMPROBANTE FINAL: ${codigoComprobante}
(Conserve este código para sus registros fiscales)

RESUMEN DE LA DONACIÓN:
- Producto donado: ${pedido.tipoAlimento}
- Cantidad: ${pedido.cantidad} ${pedido.unidad}
- Fecha de Procesamiento: ${formatearFecha(fechaEmision)}
- Estado Final: Completada

SU IMPACTO:
Su donación de ${pedido.cantidad} ${pedido.unidad} de ${pedido.tipoAlimento} está haciendo 
una diferencia real en la vida de familias que lo necesitan.

SOBRE EL BANCO DE ALIMENTOS:
${descripcionProyecto}

¿Desea realizar otra donación? Visite: ${baseUrl}/donante/nueva-donacion
Ver historial de donaciones: ${baseUrl}/donante/donaciones

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}

export function buildDonacionCanceladaEmailTemplate({
  comprobante,
  baseUrl
}: Omit<DonacionEmailTemplateInput, 'estado' | 'qrImageBase64'>): { subject: string; html: string; text: string } {
  const { usuario, pedido, fechaEmision } = comprobante;
  const comentario = pedido.comentarioAdmin;

  const subject = `❌ Donación Cancelada - Banco de Alimentos`;

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Donación Cancelada</title>
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
                Donación Cancelada
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
                Le informamos que su donación ha sido <strong>cancelada</strong>. 
                Lamentamos cualquier inconveniente que esto pueda causar.
              </p>
            </td>
          </tr>

          <!-- Donation Details -->
          <tr>
            <td style="padding: 24px 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                Detalles de la Donación
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
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Fecha de Cancelación:</td>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">${formatearFecha(fechaEmision)}</td>
                </tr>
              </table>
            </td>
          </tr>

          ${comentario ? `
          <!-- Reason -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px;">
                <h3 style="margin: 0 0 12px; font-size: 15px; color: #991b1b;">
                  Motivo de la Cancelación
                </h3>
                <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6; font-style: italic;">
                  "${escapeHtml(comentario)}"
                </p>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- What to do -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
                ¿Qué puede hacer?
              </h2>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  Si fue un error, puede <strong>registrar una nueva donación</strong> en cualquier momento.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  <strong>Contáctenos</strong> si tiene preguntas sobre la cancelación.
                </li>
                <li style="margin-bottom: 10px; line-height: 1.5; font-size: 14px;">
                  Agradecemos su <strong>intención de ayudar</strong> y esperamos contar con su apoyo en el futuro.
                </li>
              </ul>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${baseUrl}/donante/nueva-donacion" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.3);">
                Registrar Nueva Donación
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
DONACIÓN CANCELADA - BANCO DE ALIMENTOS
=======================================

Estimado/a ${usuario.nombre},

Le informamos que su donación ha sido cancelada.

DETALLES DE LA DONACIÓN:
- Producto: ${pedido.tipoAlimento}
- Cantidad: ${pedido.cantidad} ${pedido.unidad}
- Fecha de Cancelación: ${formatearFecha(fechaEmision)}

${comentario ? `MOTIVO DE LA CANCELACIÓN:\n"${comentario}"\n` : ''}

¿QUÉ PUEDE HACER?
1. Si fue un error, puede registrar una nueva donación.
2. Contáctenos si tiene preguntas sobre la cancelación.
3. Agradecemos su intención de ayudar.

Para registrar una nueva donación: ${baseUrl}/donante/nueva-donacion

---
Este mensaje fue generado automáticamente por la plataforma Banco de Alimentos.
© ${new Date().getFullYear()} Banco de Alimentos. Todos los derechos reservados.
  `.trim();

  return { subject, html, text };
}
