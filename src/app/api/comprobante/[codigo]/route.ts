/**
 * @fileoverview API para generar comprobantes electrónicos desde QR
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

    // Decodificar el payload del QR
    const payload = decodificarQRPayload(codigo);
    if (!payload) {
      return NextResponse.json(
        { error: 'Código QR inválido o corrupto' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Obtener datos según el tipo
    if (payload.t === 'S') {
      // Es una solicitud
      const { data: solicitud, error: solicitudError } = await supabase
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
          unidades (id, nombre, simbolo),
          usuarios (nombre, cedula, telefono, email, direccion)
        `)
        .eq('id', payload.p)
        .single();

      if (solicitudError || !solicitud) {
        return NextResponse.json(
          { error: 'Solicitud no encontrada' },
          { status: 404 }
        );
      }

      const comprobante: DatosComprobante = {
        codigoComprobante: payload.c,
        fechaEmision: new Date(parseInt(payload.f)).toISOString(),
        fechaVencimiento: new Date(parseInt(payload.f) + 7 * 24 * 60 * 60 * 1000).toISOString(),
        usuario: {
          id: solicitud.usuario_id,
          nombre: (solicitud.usuarios as any)?.nombre ?? 'N/A',
          email: (solicitud.usuarios as any)?.email ?? 'N/A',
          telefono: (solicitud.usuarios as any)?.telefono,
          direccion: (solicitud.usuarios as any)?.direccion,
          documento: (solicitud.usuarios as any)?.cedula,
        },
        pedido: {
          id: solicitud.id,
          tipo: 'solicitud',
          tipoAlimento: solicitud.tipo_alimento,
          cantidad: solicitud.cantidad,
          unidad: (solicitud.unidades as any)?.simbolo ?? 'unidades',
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

    } else {
      // Es una donación
      const { data: donacion, error: donacionError } = await supabase
        .from('donaciones')
        .select('*')
        .eq('id', parseInt(payload.p))
        .single();

      if (donacionError || !donacion) {
        return NextResponse.json(
          { error: 'Donación no encontrada' },
          { status: 404 }
        );
      }

      const comprobante: DatosComprobante = {
        codigoComprobante: payload.c,
        fechaEmision: new Date(parseInt(payload.f)).toISOString(),
        fechaVencimiento: new Date(parseInt(payload.f) + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  } catch (error) {
    console.error('Error procesando comprobante:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
