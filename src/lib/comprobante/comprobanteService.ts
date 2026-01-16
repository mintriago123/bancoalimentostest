/**
 * @fileoverview Servicio para generar códigos QR y comprobantes electrónicos
 */

import QRCode from 'qrcode';
import type { DatosComprobante, QRPayload } from './types';
import crypto from 'crypto';

const DESCRIPCION_PROYECTO = `
El Banco de Alimentos es una organización sin fines de lucro dedicada a combatir el hambre 
y reducir el desperdicio alimentario. Nuestra misión es recolectar alimentos excedentes de 
donantes y distribuirlos de manera equitativa a personas y familias en situación de 
vulnerabilidad alimentaria. Trabajamos con una red de voluntarios y colaboradores para 
garantizar que los alimentos lleguen en óptimas condiciones a quienes más los necesitan.
`.trim();

/**
 * Genera un código único para el comprobante
 */
export function generarCodigoComprobante(tipo: 'solicitud' | 'donacion', pedidoId: string): string {
  const prefijo = tipo === 'solicitud' ? 'SOL' : 'DON';
  const timestamp = Date.now().toString(36).toUpperCase();
  const hash = crypto.createHash('md5').update(pedidoId + timestamp).digest('hex').substring(0, 6).toUpperCase();
  return `${prefijo}-${timestamp}-${hash}`;
}

/**
 * Genera un checksum simple para validación del QR
 */
function generarChecksum(data: Omit<QRPayload, 'v'>): string {
  const str = `${data.c}|${data.t}|${data.u}|${data.p}|${data.f}`;
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 8);
}

/**
 * Genera la URL del comprobante que se codificará en el QR
 */
export function generarURLComprobante(
  baseUrl: string,
  codigoComprobante: string,
  tipo: 'solicitud' | 'donacion',
  usuarioId: string,
  pedidoId: string
): string {
  const payload: Omit<QRPayload, 'v'> = {
    c: codigoComprobante,
    t: tipo === 'solicitud' ? 'S' : 'D',
    u: usuarioId,
    p: pedidoId,
    f: Date.now().toString()
  };

  const checksum = generarChecksum(payload);
  const fullPayload: QRPayload = { ...payload, v: checksum };

  // Codificar en base64url para URL más corta (compatible con todos los entornos)
  const base64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64');
  // Convertir base64 a base64url: + -> -, / -> _, = -> (eliminar)
  const encoded = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${baseUrl}/comprobante/${encoded}`;
}

/**
 * Decodifica y valida el payload del QR
 */
export function decodificarQRPayload(encoded: string): QRPayload | null {
  try {
    // Convertir base64url a base64 estándar: - -> +, _ -> /
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Agregar padding si es necesario
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded) as QRPayload;

    // Validar checksum
    const { v, ...rest } = payload;
    const expectedChecksum = generarChecksum(rest);

    if (v !== expectedChecksum) {
      console.error('Checksum inválido en QR payload');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error decodificando QR payload:', error);
    return null;
  }
}

/**
 * Genera un código QR como imagen base64
 */
export async function generarQRBase64(url: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 200,
      margin: 2,
      color: {
        dark: '#1f2937',
        light: '#ffffff'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generando QR:', error);
    throw new Error('No se pudo generar el código QR');
  }
}

/**
 * Genera los datos completos del comprobante
 */
export function generarDatosComprobante(
  tipo: 'solicitud' | 'donacion',
  usuario: DatosComprobante['usuario'],
  pedido: DatosComprobante['pedido'],
  comentarioAdmin?: string
): DatosComprobante {
  const codigoComprobante = generarCodigoComprobante(tipo, pedido.id);
  const fechaEmision = new Date().toISOString();
  const fechaVencimiento = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días

  const instrucciones: string[] = tipo === 'solicitud'
    ? [
        'Presente este comprobante al momento de retirar los alimentos.',
        'El retiro debe realizarse dentro de los próximos 7 días hábiles.',
        'Acuda al punto de distribución indicado con un documento de identidad.',
        'Este comprobante es intransferible y de uso único.',
        'Al recibir los alimentos, firme en el campo correspondiente.'
      ]
    : [
        'Conserve este comprobante como constancia de su donación.',
        'Nuestro equipo se comunicará para coordinar la recolección.',
        'Asegúrese de que los alimentos estén en buen estado y correctamente empaquetados.',
        'Al momento de la entrega, firme en el campo correspondiente.',
        'Este documento puede ser usado para fines fiscales si aplica.'
      ];

  return {
    codigoComprobante,
    fechaEmision,
    fechaVencimiento,
    usuario,
    pedido: {
      ...pedido,
      comentarioAdmin
    },
    descripcionProyecto: DESCRIPCION_PROYECTO,
    instrucciones
  };
}

/**
 * Formatea una fecha ISO a formato legible en español
 */
export function formatearFecha(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea solo la fecha sin hora
 */
export function formatearFechaSolo(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
