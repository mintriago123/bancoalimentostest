import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy para consultas de RUC
 * Resuelve problemas de Mixed Content al hacer la petición HTTP desde el servidor
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ruc = searchParams.get('ruc');

    if (!ruc) {
      return NextResponse.json(
        { error: 'Parámetro "ruc" es requerido' },
        { status: 400 }
      );
    }

    // Obtener la URL del servicio externo desde variables de entorno del servidor
    const servicioUrl = process.env.SERVICIO_CONSULTAS_RUC || process.env.NEXT_PUBLIC_SERVICIO_CONSULTAS_RUC;
    
    if (!servicioUrl) {
      console.error('❌ Variable de entorno SERVICIO_CONSULTAS_RUC no configurada');
      return NextResponse.json(
        { error: 'Servicio de consultas no configurado' },
        { status: 500 }
      );
    }

    const url = `${servicioUrl}?ruc=${ruc}`;
    
    // Realizar la petición HTTP desde el servidor (permitido)
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    // Devolver la respuesta al cliente
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Error en proxy de consulta de RUC:', error);
    return NextResponse.json(
      { error: 'Error al consultar RUC' },
      { status: 500 }
    );
  }
}
