/**
 * @fileoverview API para generar comprobantes electrónicos desde QR o código legible
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { decodificarQRPayload, formatearFecha, formatearFechaSolo } from '@/lib/comprobante';
import type { DatosComprobante } from '@/lib/comprobante/types';

const DESCRIPCION_PROYECTO = `
El Banco de Alimentos es una organización sin fines de lucro dedicada a combatir el hambre 
y reducir el desperdicio alimentario. Nuestra misión es recolectar alimentos excedentes de 
donantes y distribuirlos de manera equitativa a personas y familias en situación de 
vulnerabilidad alimentaria.
`.trim();

/**
 * Verifica si el código es un código legible (SOL-xxx o DON-xxx)
 */
function esCodigoLegible(codigo: string): boolean {
  return /^(SOL|DON)-[A-Z0-9]+-[A-Z0-9]+$/i.test(codigo);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  try {
    const { codigo } = await params;

    if (!codigo) {
      return NextResponse.json(
        { error: 'Código de comprobante no proporcionado' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Verificar si es un código legible (SOL-xxx o DON-xxx)
    if (esCodigoLegible(codigo)) {
      return await buscarPorCodigoLegible(supabase, codigo);
    }

    // Si no es código legible, intentar decodificar como payload QR
    const payload = decodificarQRPayload(codigo);
    if (!payload) {
      return NextResponse.json(
        { error: 'Código de comprobante inválido' },
        { status: 400 }
      );
    }

    // Obtener datos según el tipo del payload QR
    if (payload.t === 'S') {
      return await obtenerSolicitudPorId(supabase, payload.p, payload.c, payload.f);
    } else {
      return await obtenerDonacionPorId(supabase, parseInt(payload.p), payload.c, payload.f);
    }
  } catch (error) {
    console.error('Error procesando comprobante:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Busca un comprobante por código legible (SOL-xxx o DON-xxx)
 */
async function buscarPorCodigoLegible(supabase: any, codigo: string) {
  const esSolicitud = codigo.toUpperCase().startsWith('SOL-');

  if (esSolicitud) {
    // Buscar en solicitudes
    const { data: solicitud, error } = await supabase
      .from('solicitudes')
      .select(`
        id,
        usuario_id,
        tipo_alimento,
        cantidad,
        estado,
        created_at,
        fecha_respuesta,
        comentario_admin,
        codigo_comprobante,
        unidades (id, nombre, simbolo),
        usuarios (nombre, cedula, telefono, email, direccion)
      `)
      .eq('codigo_comprobante', codigo.toUpperCase())
      .single();

    if (error || !solicitud) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return generarRespuestaSolicitud(solicitud, codigo);
  } else {
    // Buscar en donaciones
    const { data: donacion, error } = await supabase
      .from('donaciones')
      .select('*')
      .eq('codigo_comprobante', codigo.toUpperCase())
      .single();

    if (error || !donacion) {
      return NextResponse.json(
        { error: 'Donación no encontrada' },
        { status: 404 }
      );
    }

    return generarRespuestaDonacion(donacion, codigo);
  }
}

/**
 * Obtiene solicitud por ID (usado para payload QR)
 */
async function obtenerSolicitudPorId(supabase: any, id: string, codigoComprobante: string, fecha: string) {
  const { data: solicitud, error } = await supabase
    .from('solicitudes')
    .select(`
      id,
      usuario_id,
      tipo_alimento,
      cantidad,
      estado,
      created_at,
      fecha_respuesta,
      comentario_admin,
      codigo_comprobante,
      unidades (id, nombre, simbolo),
      usuarios (nombre, cedula, telefono, email, direccion)
    `)
    .eq('id', id)
    .single();

  if (error || !solicitud) {
    return NextResponse.json(
      { error: 'Solicitud no encontrada' },
      { status: 404 }
    );
  }

  return generarRespuestaSolicitud(solicitud, codigoComprobante, fecha);
}

/**
 * Obtiene donación por ID (usado para payload QR)
 */
async function obtenerDonacionPorId(supabase: any, id: number, codigoComprobante: string, fecha: string) {
  const { data: donacion, error } = await supabase
    .from('donaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !donacion) {
    return NextResponse.json(
      { error: 'Donación no encontrada' },
      { status: 404 }
    );
  }

  return generarRespuestaDonacion(donacion, codigoComprobante, fecha);
}

/**
 * Genera la respuesta JSON para una solicitud
 */
function generarRespuestaSolicitud(solicitud: any, codigoComprobante: string, fecha?: string) {
  const fechaEmision = fecha ? new Date(parseInt(fecha)).toISOString() : solicitud.fecha_respuesta || solicitud.created_at;
  
  const comprobante: DatosComprobante = {
    codigoComprobante: solicitud.codigo_comprobante || codigoComprobante,
    fechaEmision,
    fechaVencimiento: new Date(new Date(fechaEmision).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usuario: {
      id: solicitud.usuario_id,
      nombre: solicitud.usuarios?.nombre ?? 'N/A',
      email: solicitud.usuarios?.email ?? 'N/A',
      telefono: solicitud.usuarios?.telefono,
      direccion: solicitud.usuarios?.direccion,
      documento: solicitud.usuarios?.cedula,
    },
    pedido: {
      id: solicitud.id,
      tipo: 'solicitud',
      tipoAlimento: solicitud.tipo_alimento,
      cantidad: solicitud.cantidad,
      unidad: solicitud.unidades?.simbolo ?? 'unidades',
      estado: solicitud.estado,
      fechaCreacion: solicitud.created_at,
      fechaAprobacion: solicitud.fecha_respuesta ?? undefined,
      comentarioAdmin: solicitud.comentario_admin ?? undefined,
    },
    descripcionProyecto: DESCRIPCION_PROYECTO,
    instrucciones: [
      'Verifique los datos del beneficiario con su documento de identidad.',
      'Confirme la cantidad y tipo de alimento a entregar.',
      'Solicite la firma del beneficiario en el campo correspondiente.',
      'Firme como operador que realiza la entrega.',
      'Entregue una copia del comprobante al beneficiario.',
    ],
  };

  return NextResponse.json({
    success: true,
    tipo: 'solicitud',
    comprobante,
    formatoFechas: {
      fechaEmision: formatearFecha(comprobante.fechaEmision),
      fechaVencimiento: formatearFechaSolo(comprobante.fechaVencimiento),
      fechaCreacion: formatearFecha(comprobante.pedido.fechaCreacion),
    },
  });
}

/**
 * Genera la respuesta JSON para una donación
 */
function generarRespuestaDonacion(donacion: any, codigoComprobante: string, fecha?: string) {
  const fechaEmision = fecha ? new Date(parseInt(fecha)).toISOString() : donacion.actualizado_en || donacion.creado_en;

  const comprobante: DatosComprobante = {
    codigoComprobante: donacion.codigo_comprobante || codigoComprobante,
    fechaEmision,
    fechaVencimiento: new Date(new Date(fechaEmision).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usuario: {
      id: donacion.user_id,
      nombre: donacion.nombre_donante,
      email: donacion.email,
      telefono: donacion.telefono,
      direccion: donacion.direccion_donante_completa,
      documento: donacion.cedula_donante ?? donacion.ruc_donante,
    },
    pedido: {
      id: String(donacion.id),
      tipo: 'donacion',
      tipoAlimento: donacion.tipo_producto,
      cantidad: donacion.cantidad,
      unidad: donacion.unidad_simbolo ?? 'unidades',
      estado: donacion.estado,
      fechaCreacion: donacion.creado_en,
      fechaAprobacion: donacion.actualizado_en,
    },
    descripcionProyecto: DESCRIPCION_PROYECTO,
    instrucciones: [
      'Verifique los datos del donante con su documento de identidad.',
      'Inspeccione los alimentos antes de recibirlos.',
      'Confirme la cantidad y tipo de alimento donado.',
      'Solicite la firma del donante en el campo correspondiente.',
      'Firme como operador que recibe la donación.',
      'Entregue una copia del comprobante al donante.',
    ],
  };

  return NextResponse.json({
    success: true,
    tipo: 'donacion',
    comprobante,
    formatoFechas: {
      fechaEmision: formatearFecha(comprobante.fechaEmision),
      fechaVencimiento: formatearFechaSolo(comprobante.fechaVencimiento),
      fechaCreacion: formatearFecha(comprobante.pedido.fechaCreacion),
    },
  });
}
