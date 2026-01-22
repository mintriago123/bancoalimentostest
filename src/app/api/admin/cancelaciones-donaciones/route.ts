/**
 * @fileoverview API para consultar historial de cancelaciones de donaciones
 * Endpoint para obtener cancelaciones con filtros y estadísticas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { DonacionCanceladaDetalle, EstadisticasCancelaciones } from '@/modules/admin/reportes/cancelaciones/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cancelaciones-donaciones
 * Obtiene el historial de donaciones canceladas con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar rol de administrador
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', user.id)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (usuario.rol !== 'ADMINISTRADOR') {
      return NextResponse.json(
        { error: 'No tienes permisos para acceder a este recurso' },
        { status: 403 }
      );
    }

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams;
    const motivo = searchParams.get('motivo');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const incluirEstadisticas = searchParams.get('estadisticas') === 'true';

    // Construir consulta base
    let query = supabase
      .from('donaciones')
      .select(`
        id,
        user_id,
        nombre_donante,
        tipo_producto,
        cantidad,
        unidad_nombre,
        unidad_simbolo,
        estado,
        motivo_cancelacion,
        observaciones_cancelacion,
        usuario_cancelacion_id,
        fecha_cancelacion,
        fecha_disponible,
        creado_en,
        categoria_comida,
        direccion_entrega,
        telefono,
        email,
        impacto_estimado_personas,
        codigo_comprobante
      `, { count: 'exact' })
      .eq('estado', 'Cancelada');

    // Solo filtrar por motivo si existe y no es null
    // Esto permite que funcione incluso si los campos nuevos no existen aún
    if (motivo && motivo !== 'todos') {
      query = query.eq('motivo_cancelacion', motivo);
    }

    if (fechaInicio) {
      query = query.gte('fecha_cancelacion', fechaInicio);
    }

    if (fechaFin) {
      // Agregar un día para incluir todo el día final
      const fechaFinAjustada = new Date(fechaFin);
      fechaFinAjustada.setDate(fechaFinAjustada.getDate() + 1);
      query = query.lt('fecha_cancelacion', fechaFinAjustada.toISOString());
    }

    // Ordenar por fecha de cancelación (más recientes primero)
    query = query.order('fecha_cancelacion', { ascending: false });

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    const { data: cancelaciones, error: cancelacionesError, count } = await query;

    if (cancelacionesError) {
      console.error('Error al consultar cancelaciones:', cancelacionesError);
      
      // Si el error es por columnas que no existen, devolver mensaje específico
      if (cancelacionesError.message?.includes('column') || cancelacionesError.code === '42703') {
        return NextResponse.json(
          { 
            error: 'Los campos de cancelación no existen en la base de datos. Por favor, ejecuta el script SQL: database/agregar-campos-cancelacion-donaciones.sql',
            details: cancelacionesError.message
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: 'Error al obtener el historial de cancelaciones' },
        { status: 500 }
      );
    }

    if (!cancelaciones) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          total: 0,
          offset,
          limit,
          has_more: false
        }
      });
    }

    // Obtener datos de usuarios que cancelaron (filtrar nulls)
    const usuariosCancelacionIds = [...new Set(
      cancelaciones
        .map(c => c.usuario_cancelacion_id)
        .filter((id): id is string => id !== null && id !== undefined)
    )];
    
    let usuariosCancelacion: Array<{ id: string; nombre: string; email: string; rol: string }> = [];
    
    if (usuariosCancelacionIds.length > 0) {
      const { data, error: usuariosError } = await supabase
        .from('usuarios')
        .select('id, nombre, email, rol')
        .in('id', usuariosCancelacionIds);

      if (usuariosError) {
        console.error('Error al obtener usuarios:', usuariosError);
      } else {
        usuariosCancelacion = data || [];
      }
    }

    // Mapear usuarios por ID
    const usuariosMap = new Map(
      usuariosCancelacion.map(u => [u.id, u])
    );

    // Combinar datos
    const cancelacionesDetalle: DonacionCanceladaDetalle[] = cancelaciones.map(cancelacion => ({
      ...cancelacion,
      usuario_cancelacion_nombre: cancelacion.usuario_cancelacion_id 
        ? (usuariosMap.get(cancelacion.usuario_cancelacion_id)?.nombre || 'Desconocido')
        : 'Sistema',
      usuario_cancelacion_email: cancelacion.usuario_cancelacion_id
        ? (usuariosMap.get(cancelacion.usuario_cancelacion_id)?.email || '')
        : '',
      usuario_cancelacion_rol: cancelacion.usuario_cancelacion_id
        ? (usuariosMap.get(cancelacion.usuario_cancelacion_id)?.rol || '')
        : ''
    }));

    // Calcular estadísticas si se solicitan
    let estadisticas: EstadisticasCancelaciones | undefined;

    if (incluirEstadisticas) {
      const { data: statsData, error: statsError } = await supabase
        .from('donaciones')
        .select('motivo_cancelacion, cantidad')
        .eq('estado', 'Cancelada')
        .not('motivo_cancelacion', 'is', null);

      if (!statsError && statsData) {
        const stats = {
          total: {
            cancelaciones: statsData.length,
            cantidad_total: statsData.reduce((sum, item) => sum + (item.cantidad || 0), 0)
          },
          por_motivo: {
            error_donante: { cancelaciones: 0, cantidad: 0 },
            no_disponible: { cancelaciones: 0, cantidad: 0 },
            calidad_inadecuada: { cancelaciones: 0, cantidad: 0 },
            logistica_imposible: { cancelaciones: 0, cantidad: 0 },
            duplicado: { cancelaciones: 0, cantidad: 0 },
            solicitud_donante: { cancelaciones: 0, cantidad: 0 },
            otro: { cancelaciones: 0, cantidad: 0 }
          }
        };

        statsData.forEach(item => {
          const motivo = item.motivo_cancelacion as keyof typeof stats.por_motivo;
          if (stats.por_motivo[motivo]) {
            stats.por_motivo[motivo].cancelaciones++;
            stats.por_motivo[motivo].cantidad += item.cantidad || 0;
          }
        });

        estadisticas = stats;
      }
    }

    return NextResponse.json({
      success: true,
      data: cancelacionesDetalle,
      pagination: {
        total: count || 0,
        offset,
        limit,
        has_more: (offset + limit) < (count || 0)
      },
      ...(estadisticas && { estadisticas })
    });

  } catch (error) {
    console.error('Error en GET /api/admin/cancelaciones-donaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
