/**
 * @fileoverview API para obtener alertas de productos próximos a vencer o vencidos
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/operador/alertas-vencimiento
 * Obtiene productos próximos a vencer o vencidos
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

    // Verificar rol y estado
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
    const dias_umbral = parseInt(searchParams.get('dias') || '7');
    const solo_vencidos = searchParams.get('solo_vencidos') === 'true';
    const prioridad = searchParams.get('prioridad'); // alta, media, baja, vencido

    // Llamar función de base de datos
    const { data, error } = await supabase
      .rpc('obtener_productos_proximos_vencer', {
        p_dias_umbral: dias_umbral
      });

    if (error) {
      console.error('Error al obtener alertas de vencimiento:', error);
      return NextResponse.json(
        { error: 'Error al consultar productos próximos a vencer' },
        { status: 500 }
      );
    }

    let alertas = data || [];

    // Aplicar filtros adicionales
    if (solo_vencidos) {
      alertas = alertas.filter((alerta: any) => alerta.prioridad === 'vencido');
    }

    if (prioridad && prioridad !== 'todos') {
      alertas = alertas.filter((alerta: any) => alerta.prioridad === prioridad);
    }

    // Clasificar alertas por prioridad
    const clasificadas = {
      vencidos: alertas.filter((a: any) => a.prioridad === 'vencido'),
      alta: alertas.filter((a: any) => a.prioridad === 'alta'),
      media: alertas.filter((a: any) => a.prioridad === 'media'),
      baja: alertas.filter((a: any) => a.prioridad === 'baja')
    };

    // Calcular estadísticas
    const estadisticas = {
      total: alertas.length,
      total_vencidos: clasificadas.vencidos.length,
      total_proximos: alertas.length - clasificadas.vencidos.length,
      cantidad_total_vencidos: clasificadas.vencidos.reduce(
        (sum: number, a: any) => sum + Number(a.cantidad_disponible), 
        0
      ),
      cantidad_total_proximos: clasificadas.alta.concat(clasificadas.media, clasificadas.baja).reduce(
        (sum: number, a: any) => sum + Number(a.cantidad_disponible), 
        0
      ),
      por_prioridad: {
        vencidos: clasificadas.vencidos.length,
        alta: clasificadas.alta.length,
        media: clasificadas.media.length,
        baja: clasificadas.baja.length
      }
    };

    return NextResponse.json({
      success: true,
      configuracion: {
        dias_umbral,
        solo_vencidos
      },
      estadisticas,
      alertas: alertas.map((alerta: any) => ({
        id_inventario: alerta.id_inventario,
        id_producto: alerta.id_producto,
        nombre_producto: alerta.nombre_producto,
        cantidad_disponible: Number(alerta.cantidad_disponible),
        fecha_caducidad: alerta.fecha_caducidad,
        dias_para_vencer: alerta.dias_para_vencer,
        deposito: {
          id: alerta.id_deposito,
          nombre: alerta.nombre_deposito
        },
        unidad_simbolo: alerta.unidad_simbolo,
        prioridad: alerta.prioridad,
        estado: alerta.prioridad === 'vencido' ? 'vencido' : 'proximo_vencer'
      }))
    });

  } catch (error) {
    console.error('Error en GET /api/operador/alertas-vencimiento:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
