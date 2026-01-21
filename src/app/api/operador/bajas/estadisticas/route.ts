/**
 * @fileoverview API para obtener estadísticas de bajas de productos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/operador/bajas/estadisticas
 * Obtiene estadísticas de bajas por periodo
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

    // Verificar rol
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', user.id)
      .single();

    if (usuarioError || !usuario || usuario.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Obtener parámetros
    const searchParams = request.nextUrl.searchParams;
    const periodo = searchParams.get('periodo') || '30'; // días
    
    // Calcular fechas
    const fecha_fin = new Date();
    const fecha_inicio = new Date();
    fecha_inicio.setDate(fecha_inicio.getDate() - parseInt(periodo));

    // Llamar función de estadísticas
    const { data, error } = await supabase
      .rpc('obtener_estadisticas_bajas', {
        p_fecha_inicio: fecha_inicio.toISOString(),
        p_fecha_fin: fecha_fin.toISOString()
      });

    if (error) {
      console.error('Error al obtener estadísticas:', error);
      return NextResponse.json(
        { error: 'Error al consultar estadísticas' },
        { status: 500 }
      );
    }

    const stats = data?.[0] || {
      total_bajas: 0,
      total_cantidad: 0,
      bajas_por_vencido: 0,
      bajas_por_danado: 0,
      bajas_por_contaminado: 0,
      bajas_por_rechazado: 0,
      bajas_por_otro: 0,
      cantidad_vencido: 0,
      cantidad_danado: 0,
      cantidad_contaminado: 0,
      cantidad_rechazado: 0,
      cantidad_otro: 0
    };

    return NextResponse.json({
      success: true,
      periodo: {
        dias: parseInt(periodo),
        fecha_inicio: fecha_inicio.toISOString(),
        fecha_fin: fecha_fin.toISOString()
      },
      estadisticas: {
        total: {
          bajas: Number(stats.total_bajas),
          cantidad: Number(stats.total_cantidad)
        },
        por_motivo: {
          vencido: {
            bajas: Number(stats.bajas_por_vencido),
            cantidad: Number(stats.cantidad_vencido)
          },
          dañado: {
            bajas: Number(stats.bajas_por_danado),
            cantidad: Number(stats.cantidad_danado)
          },
          contaminado: {
            bajas: Number(stats.bajas_por_contaminado),
            cantidad: Number(stats.cantidad_contaminado)
          },
          rechazado: {
            bajas: Number(stats.bajas_por_rechazado),
            cantidad: Number(stats.cantidad_rechazado)
          },
          otro: {
            bajas: Number(stats.bajas_por_otro),
            cantidad: Number(stats.cantidad_otro)
          }
        }
      }
    });

  } catch (error) {
    console.error('Error en GET /api/operador/bajas/estadisticas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
