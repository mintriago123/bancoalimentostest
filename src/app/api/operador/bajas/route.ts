/**
 * @fileoverview API para gestionar bajas de productos
 * Endpoints para registrar bajas, consultar historial y obtener estadísticas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface BajaProductoRequest {
  id_inventario: string;
  cantidad: number;
  motivo: 'vencido' | 'dañado' | 'contaminado' | 'rechazado' | 'otro';
  observaciones?: string;
}

/**
 * POST /api/operador/bajas
 * Registra una nueva baja de producto
 */
export async function POST(request: NextRequest) {
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

    if (usuarioError || !usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (!['ADMINISTRADOR', 'OPERADOR'].includes(usuario.rol)) {
      return NextResponse.json(
        { error: 'No tienes permisos para realizar esta operación' },
        { status: 403 }
      );
    }

    if (usuario.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      );
    }

    // Obtener datos del request
    const body: BajaProductoRequest = await request.json();
    const { id_inventario, cantidad, motivo, observaciones } = body;

    // Validaciones
    if (!id_inventario || !cantidad || !motivo) {
      return NextResponse.json(
        { error: 'Datos incompletos. Se requiere id_inventario, cantidad y motivo' },
        { status: 400 }
      );
    }

    if (cantidad <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser mayor a 0' },
        { status: 400 }
      );
    }

    const motivosValidos = ['vencido', 'dañado', 'contaminado', 'rechazado', 'otro'];
    if (!motivosValidos.includes(motivo)) {
      return NextResponse.json(
        { error: `Motivo inválido. Opciones: ${motivosValidos.join(', ')}` },
        { status: 400 }
      );
    }

    // Llamar a la función de base de datos
    const { data, error } = await supabase
      .rpc('dar_baja_producto', {
        p_id_inventario: id_inventario,
        p_cantidad: cantidad,
        p_motivo: motivo,
        p_usuario_id: user.id,
        p_observaciones: observaciones || null
      });

    if (error) {
      console.error('Error al dar de baja producto:', error);
      return NextResponse.json(
        { error: 'Error al procesar la baja del producto', details: error.message },
        { status: 500 }
      );
    }

    // La función retorna un array con un objeto
    const resultado = data?.[0];
    
    if (!resultado?.success) {
      return NextResponse.json(
        { error: resultado?.message || 'No se pudo completar la baja' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resultado.message,
      data: {
        id_baja: resultado.id_baja,
        cantidad_restante: resultado.cantidad_restante
      }
    });

  } catch (error) {
    console.error('Error en POST /api/operador/bajas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/operador/bajas
 * Obtiene el historial de bajas con filtros opcionales
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

    // Obtener parámetros de búsqueda
    const searchParams = request.nextUrl.searchParams;
    const motivo = searchParams.get('motivo');
    const fecha_inicio = searchParams.get('fecha_inicio');
    const fecha_fin = searchParams.get('fecha_fin');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Construir query
    let query = supabase
      .from('v_bajas_productos_detalle')
      .select('*', { count: 'exact' })
      .order('fecha_baja', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (motivo && motivo !== 'todos') {
      query = query.eq('motivo_baja', motivo);
    }

    if (fecha_inicio) {
      query = query.gte('fecha_baja', fecha_inicio);
    }

    if (fecha_fin) {
      query = query.lte('fecha_baja', fecha_fin);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error al obtener bajas:', error);
      return NextResponse.json(
        { error: 'Error al consultar bajas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: count ? count > offset + limit : false
      }
    });

  } catch (error) {
    console.error('Error en GET /api/operador/bajas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
