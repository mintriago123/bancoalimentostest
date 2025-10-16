'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import Toast from '@/app/components/ui/Toast';
import { useToast } from '@/app/hooks/useToast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  User,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  X
} from 'lucide-react';

interface Solicitud {
  id: string;
  usuario_id: string;
  tipo_alimento: string;
  cantidad: number;
  comentarios?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  created_at: string;
  latitud?: number;
  longitud?: number;
  fecha_respuesta?: string;
  comentario_admin?: string;
  usuarios: {
    nombre: string;
    cedula: string;
    telefono: string;
    email?: string;
    direccion?: string;
    tipo_persona?: string;
  } | null;
}

interface FiltroEstado {
  todos: boolean;
  pendiente: boolean;
  aprobada: boolean;
  rechazada: boolean;
}

interface InventarioDisponible {
  id: string;
  tipo_alimento: string;
  cantidad_disponible: number;
  deposito: string;
  fecha_vencimiento?: string;
}

interface ProductoInventario {
  id_producto: string;
  nombre_producto: string;
}

interface ResultadoInventario {
  cantidadRestante: number;
  productosActualizados: number;
  noStock?: boolean;
  error?: boolean;
}

export default function SolicitudesPage() {
  const { supabase } = useSupabase();
  const { toasts, showSuccess, showError, showWarning, showInfo, hideToast } = useToast();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [solicitudesFiltradas, setSolicitudesFiltradas] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<Solicitud | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comentarioAdmin, setComentarioAdmin] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [inventarioDisponible, setInventarioDisponible] = useState<InventarioDisponible[]>([]);
  const [cargandoInventario, setCargandoInventario] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>({
    todos: true,
    pendiente: false,
    aprobada: false,
    rechazada: false
  });

  const cargarSolicitudes = useCallback(async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('solicitudes')
        .select(`
          id,
          usuario_id,
          tipo_alimento,
          cantidad,
          comentarios,
          estado,
          created_at,
          latitud,
          longitud,
          usuarios:usuario_id (
            nombre,
            cedula,
            telefono,
            direccion,
            tipo_persona
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSolicitudes((data as unknown as Solicitud[]) || []);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setCargando(false);
    }
  }, [supabase]);

  const aplicarFiltros = useCallback(() => {
    let filtradas = [...solicitudes];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      filtradas = filtradas.filter(s => 
        s.usuarios?.nombre?.toLowerCase().includes(terminoBusqueda) ||
        s.usuarios?.cedula?.includes(terminoBusqueda) ||
        s.tipo_alimento?.toLowerCase().includes(terminoBusqueda) ||
        s.usuarios?.telefono?.includes(terminoBusqueda)
      );
    }

    // Filtro por estado
    if (!filtroEstado.todos) {
      filtradas = filtradas.filter(s => {
        if (filtroEstado.pendiente && s.estado === 'pendiente') return true;
        if (filtroEstado.aprobada && s.estado === 'aprobada') return true;
        if (filtroEstado.rechazada && s.estado === 'rechazada') return true;
        return false;
      });
    }

    setSolicitudesFiltradas(filtradas);
  }, [solicitudes, busqueda, filtroEstado]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const actualizarEstado = async (solicitudId: string, nuevoEstado: 'aprobada' | 'rechazada') => {
    try {
      // Obtener la solicitud actual para procesamiento
      const solicitudActual = solicitudes.find(s => s.id === solicitudId);
      if (!solicitudActual) {
        showError('Solicitud no encontrada');
        return;
      }

      // Actualizar estado en la base de datos
      const { error } = await supabase
        .from('solicitudes')
        .update({ 
          estado: nuevoEstado,
          // fecha_respuesta: new Date().toISOString(),
          // comentario_admin: comentario || null
        })
        .eq('id', solicitudId);

      if (error) throw error;

      let mensajeFinal = '';

      // LÓGICA DE INTEGRACIÓN CON INVENTARIO Y MOVIMIENTOS
      if (nuevoEstado === 'aprobada' && solicitudActual.estado === 'pendiente') {
        const resultadoInventario = await descontarDelInventario(solicitudActual);
        
        // REGISTRAR MOVIMIENTO CUANDO SE APRUEBA LA SOLICITUD
        await registrarMovimientoSolicitud(solicitudActual, resultadoInventario);
        
        if (resultadoInventario.error) {
          mensajeFinal = `⚠️ Solicitud aprobada, pero hubo un error al actualizar el inventario.`;
          showWarning(mensajeFinal);
        } else if (resultadoInventario.noStock) {
          mensajeFinal = `⚠️ Solicitud aprobada, pero no hay productos en inventario que coincidan con "${solicitudActual.tipo_alimento}".`;
          showWarning(mensajeFinal);
        } else if (resultadoInventario.cantidadRestante > 0) {
          mensajeFinal = `⚠️ Solicitud aprobada parcialmente. Se descontaron ${solicitudActual.cantidad - resultadoInventario.cantidadRestante} unidades de ${solicitudActual.cantidad} solicitadas. Cantidad no satisfecha: ${resultadoInventario.cantidadRestante}`;
          showWarning(mensajeFinal);
        } else {
          mensajeFinal = `✅ Solicitud aprobada exitosamente y descontada del inventario completamente.`;
          showSuccess(mensajeFinal);
        }
      } else {
        mensajeFinal = `Solicitud ${nuevoEstado} exitosamente`;
        showSuccess(mensajeFinal);
      }
      
      await cargarSolicitudes();
      setMostrarModal(false);
      setSolicitudSeleccionada(null);
      setComentarioAdmin('');
      
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showError(`Error al actualizar estado: ${error}`);
    }
  };

  // Nueva función para descontar del inventario
  const descontarDelInventario = async (solicitud: Solicitud): Promise<ResultadoInventario> => {
    try {
      console.log('Descontando solicitud del inventario:', solicitud);

      const productosCoincidentes = await buscarProductosCoincidentes(solicitud.tipo_alimento);
      if (!productosCoincidentes || productosCoincidentes.length === 0) {
        console.warn(`No se encontraron productos que coincidan con: ${solicitud.tipo_alimento}`);
        return { cantidadRestante: solicitud.cantidad, productosActualizados: 0, noStock: true };
      }

      const resultado = await procesarDescuentoInventario(productosCoincidentes, solicitud);
      return resultado;

    } catch (error) {
      console.error('Error descontando del inventario:', error);
      return { cantidadRestante: solicitud.cantidad, productosActualizados: 0, error: true };
    }
  };

  const buscarProductosCoincidentes = async (tipoAlimento: string) => {
    const { data: productosCoincidentes, error: errorBusqueda } = await supabase
      .from('productos_donados')
      .select('id_producto, nombre_producto')
      .ilike('nombre_producto', `%${tipoAlimento}%`);

    if (errorBusqueda) {
      throw errorBusqueda;
    }

    return productosCoincidentes;
  };

  const procesarDescuentoInventario = async (productosCoincidentes: ProductoInventario[], solicitud: Solicitud) => {
    let cantidadRestante = solicitud.cantidad;
    let productosActualizados = 0;

    for (const producto of productosCoincidentes) {
      if (cantidadRestante <= 0) break;

      const resultado = await descontarDeProducto(producto, cantidadRestante);
      cantidadRestante = resultado.cantidadRestante;
      productosActualizados += resultado.productosActualizados;
    }

    return { cantidadRestante, productosActualizados };
  };

  const descontarDeProducto = async (producto: ProductoInventario, cantidadRestante: number) => {
    const { data: inventarioItems, error: errorInventario } = await supabase
      .from('inventario')
      .select('id_inventario, cantidad_disponible, id_deposito')
      .eq('id_producto', producto.id_producto)
      .gt('cantidad_disponible', 0)
      .order('fecha_actualizacion', { ascending: true });

    if (errorInventario || !inventarioItems || inventarioItems.length === 0) {
      console.log(`No hay stock disponible para producto: ${producto.nombre_producto}`);
      return { cantidadRestante, productosActualizados: 0 };
    }

    let productosActualizados = 0;
    for (const item of inventarioItems) {
      if (cantidadRestante <= 0) break;

      const cantidadADescontar = Math.min(cantidadRestante, item.cantidad_disponible);
      const nuevaCantidad = item.cantidad_disponible - cantidadADescontar;

      const { error: errorActualizacion } = await supabase
        .from('inventario')
        .update({
          cantidad_disponible: nuevaCantidad,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_inventario', item.id_inventario);

      if (!errorActualizacion) {
        cantidadRestante -= cantidadADescontar;
        productosActualizados++;
        console.log(`Descontado: ${cantidadADescontar} de ${producto.nombre_producto} (Restante en stock: ${nuevaCantidad})`);
      }
    }

    return { cantidadRestante, productosActualizados };
  };

  // Nueva función para registrar movimientos de solicitudes aprobadas
  const registrarMovimientoSolicitud = async (solicitud: Solicitud, resultadoInventario: ResultadoInventario) => {
    try {
      console.log('Registrando movimiento de solicitud aprobada:', solicitud);

      // Obtener información del administrador actual (quien aprueba)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No se pudo obtener el usuario administrador para el movimiento');
        return;
      }

      // 1. Crear cabecera del movimiento
      const { data: movimientoCabecera, error: errorCabecera } = await supabase
        .from('movimiento_inventario_cabecera')
        .insert({
          fecha_movimiento: new Date().toISOString(),
          id_donante: user.id, // El admin que aprueba la solicitud
          id_solicitante: solicitud.usuario_id,
          estado_movimiento: 'completado',
          observaciones: `Solicitud aprobada - ${solicitud.tipo_alimento} (${solicitud.cantidad} unidades)`
        })
        .select('id_movimiento')
        .single();

      if (errorCabecera) {
        console.error('Error creando cabecera de movimiento:', errorCabecera);
        return;
      }

      // 2. Buscar productos que coincidan para crear los detalles
      const productosCoincidentes = await buscarProductosCoincidentes(solicitud.tipo_alimento);
      
      if (productosCoincidentes && productosCoincidentes.length > 0) {
        // Crear detalle del movimiento para cada producto afectado
        const cantidadEntregada = solicitud.cantidad - (resultadoInventario.cantidadRestante || 0);
        
        for (const producto of productosCoincidentes) {
          const { error: errorDetalle } = await supabase
            .from('movimiento_inventario_detalle')
            .insert({
              id_movimiento: movimientoCabecera.id_movimiento,
              id_producto: producto.id_producto,
              cantidad: cantidadEntregada / productosCoincidentes.length, // Distribuir proporcionalmente
              tipo_transaccion: 'egreso',
              rol_usuario: 'beneficiario',
              observacion_detalle: `Entrega por solicitud aprobada - ${solicitud.tipo_alimento}`
            });

          if (errorDetalle) {
            console.error('Error creando detalle de movimiento:', errorDetalle);
          }
        }
      }

      console.log('Movimiento registrado exitosamente');
    } catch (error) {
      console.error('Error registrando movimiento de solicitud:', error);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprobada': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="w-4 h-4" />;
      case 'aprobada': return <CheckCircle className="w-4 h-4" />;
      case 'rechazada': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const cambiarFiltroEstado = (filtro: keyof FiltroEstado) => {
    if (filtro === 'todos') {
      setFiltroEstado({
        todos: true,
        pendiente: false,
        aprobada: false,
        rechazada: false
      });
    } else {
      setFiltroEstado(prev => ({
        ...prev,
        todos: false,
        [filtro]: !prev[filtro]
      }));
    }
  };

  const abrirModalDetalle = (solicitud: Solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setComentarioAdmin(solicitud.comentario_admin || '');
    setMostrarModal(true);
    cargarInventarioDisponible(solicitud.tipo_alimento);
  };

  const cargarInventarioDisponible = async (tipoAlimento: string) => {
    try {
      setCargandoInventario(true);
      const { data, error } = await supabase
        .from('inventario')
        .select(`
          id_inventario,
          cantidad_disponible,
          fecha_actualizacion,
          productos_donados!inner(
            nombre_producto
          ),
          depositos!inner(
            nombre
          )
        `)
        .ilike('productos_donados.nombre_producto', `%${tipoAlimento}%`)
        .gt('cantidad_disponible', 0)
        .order('fecha_actualizacion', { ascending: true, nullsFirst: false });

      if (error) throw error;

      const inventarioFormateado = data.map(item => ({
        id: item.id_inventario,
        tipo_alimento: Array.isArray(item.productos_donados) 
          ? item.productos_donados[0]?.nombre_producto || 'Producto desconocido'
          : 'Producto desconocido',
        cantidad_disponible: item.cantidad_disponible,
        deposito: Array.isArray(item.depositos) 
          ? item.depositos[0]?.nombre || 'Depósito desconocido'
          : 'Depósito desconocido',
        fecha_vencimiento: item.fecha_actualizacion // Usando fecha_actualizacion como referencia
      }));

      setInventarioDisponible(inventarioFormateado);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
      setInventarioDisponible([]);
    } finally {
      setCargandoInventario(false);
    }
  };

  const revertirAPendiente = async (solicitudId: string) => {
    try {
      const { error } = await supabase
        .from('solicitudes')
        .update({ estado: 'pendiente' })
        .eq('id', solicitudId);

      if (error) throw error;

      setSolicitudes(prev => prev.map(s => 
        s.id === solicitudId ? { ...s, estado: 'pendiente' } : s
      ));
      showSuccess('Solicitud revertida a pendiente exitosamente');
    } catch (error) {
      console.error('Error al revertir solicitud:', error);
      showError('Error al revertir la solicitud');
    }
  };

  const renderBotonesAcciones = (solicitud: Solicitud) => {
    const handleAbrirModal = () => abrirModalDetalle(solicitud);
    const handleAprobar = () => actualizarEstado(solicitud.id, 'aprobada');
    const handleRechazar = () => actualizarEstado(solicitud.id, 'rechazada');
    const handleRevertir = () => revertirAPendiente(solicitud.id);

    if (solicitud.estado === 'pendiente') {
      return (
        <>
          <button
            onClick={handleAbrirModal}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={handleAprobar}
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
            title="Aprobar (se descontará del inventario)"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleRechazar}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
            title="Rechazar"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      );
    }

    if (solicitud.estado === 'aprobada') {
      return (
        <>
          <button
            onClick={handleAbrirModal}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <FileText className="w-4 h-4" />
          </button>
          <span className="text-green-600 px-2 py-1 rounded border border-green-200 bg-green-50 text-xs">
            ✓ Descontado de inventario
          </span>
          <button
            onClick={handleRevertir}
            className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
            title="Revertir a pendiente"
          >
            <Clock className="w-4 h-4" />
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={handleAbrirModal}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <FileText className="w-4 h-4" />
        </button>
        <button
          onClick={handleRevertir}
          className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg transition-colors"
          title="Revertir a pendiente"
        >
          <Clock className="w-4 h-4" />
        </button>
      </>
    );
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContadorPorEstado = () => {
    const contador = {
      pendiente: 0,
      aprobada: 0,
      rechazada: 0,
      TOTAL: solicitudes.length
    };

    solicitudes.forEach(s => {
      contador[s.estado as keyof typeof contador]++;
    });

    return contador;
  };

  const contador = getContadorPorEstado();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Solicitudes</h1>
            <p className="text-sm text-gray-600 mt-1">Administra y gestiona todas las solicitudes de alimentos</p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{contador.TOTAL}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{contador.pendiente}</div>
              <div className="text-xs text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{contador.aprobada}</div>
              <div className="text-xs text-green-600">Aprobadas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{contador.rechazada}</div>
              <div className="text-xs text-red-600">Rechazadas</div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, cédula, alimento o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Filtros de estado */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Filtrar:</span>
              {Object.entries(filtroEstado).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => cambiarFiltroEstado(key as keyof FiltroEstado)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    value 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabla de solicitudes */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitud
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {solicitud.usuarios?.nombre || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span>{solicitud.usuarios?.cedula || 'Sin cédula'}</span>
                              {solicitud.usuarios?.tipo_persona && (
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                  {solicitud.usuarios.tipo_persona}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {solicitud.tipo_alimento}
                          </div>
                          <div className="text-sm text-gray-500">
                            Cantidad: {solicitud.cantidad} unidades
                          </div>
                          {solicitud.latitud && solicitud.longitud && (
                            <div className="flex items-center text-xs text-blue-600 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              Ubicación disponible
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatearFecha(solicitud.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(solicitud.estado)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(solicitud.estado)}`}>
                            {solicitud.estado}
                          </span>
                        </div>
                        {solicitud.fecha_respuesta && (
                          <div className="text-xs text-gray-500 mt-1">
                            Respuesta: {formatearFecha(solicitud.fecha_respuesta)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {renderBotonesAcciones(solicitud)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {solicitudesFiltradas.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileText className="w-16 h-16 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">
                  {solicitudes.length === 0 
                    ? 'No hay solicitudes registradas' 
                    : 'No se encontraron solicitudes con los filtros aplicados'
                  }
                </p>
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="mt-2 text-red-600 hover:text-red-700 underline"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal de detalles */}
        {mostrarModal && solicitudSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Detalles de la Solicitud</h2>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Información del solicitante */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Información del Solicitante
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Nombre:</strong> {solicitudSeleccionada.usuarios?.nombre || 'N/A'}</div>
                      <div><strong>Cédula:</strong> {solicitudSeleccionada.usuarios?.cedula || 'N/A'}</div>
                      <div><strong>Tipo:</strong> {solicitudSeleccionada.usuarios?.tipo_persona || 'N/A'}</div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {solicitudSeleccionada.usuarios?.telefono || 'N/A'}
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {solicitudSeleccionada.usuarios?.email || 'N/A'}
                      </div>
                      {solicitudSeleccionada.usuarios?.direccion && (
                        <div><strong>Dirección:</strong> {solicitudSeleccionada.usuarios.direccion}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Detalles de la Solicitud
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Alimento solicitado:</strong> {solicitudSeleccionada.tipo_alimento}</div>
                      <div><strong>Cantidad:</strong> {solicitudSeleccionada.cantidad} unidades</div>
                      <div><strong>Fecha de solicitud:</strong> {formatearFecha(solicitudSeleccionada.created_at)}</div>
                      <div className="flex items-center">
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(solicitudSeleccionada.estado)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(solicitudSeleccionada.estado)}`}>
                            {solicitudSeleccionada.estado}
                          </span>
                        </div>
                      </div>
                      {solicitudSeleccionada.fecha_respuesta && (
                        <div><strong>Fecha de respuesta:</strong> {formatearFecha(solicitudSeleccionada.fecha_respuesta)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comentarios */}
                <div className="space-y-4">
                  {solicitudSeleccionada.comentarios && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Comentarios del Solicitante
                      </h4>
                      <p className="text-sm text-gray-700">{solicitudSeleccionada.comentarios}</p>
                    </div>
                  )}

                  {solicitudSeleccionada.comentario_admin && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Comentario Administrativo Anterior</h4>
                      <p className="text-sm text-gray-700">{solicitudSeleccionada.comentario_admin}</p>
                    </div>
                  )}
                </div>

                {/* Disponibilidad en Inventario */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Disponibilidad en Inventario
                  </h4>
                  
                  {cargandoInventario ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      <p className="text-sm text-gray-600 mt-2">Consultando inventario...</p>
                    </div>
                  ) : (
                    <>
                      {inventarioDisponible.length > 0 ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {inventarioDisponible.map((item) => (
                              <div key={item.id} className="bg-white p-3 rounded border">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">{item.tipo_alimento}</div>
                                  <div className="text-gray-600">Depósito: {item.deposito}</div>
                                  <div className={`font-semibold ${
                                    item.cantidad_disponible >= solicitudSeleccionada.cantidad 
                                      ? 'text-green-600' 
                                      : 'text-orange-600'
                                  }`}>
                                    Disponible: {item.cantidad_disponible} unidades
                                  </div>
                                  {item.fecha_vencimiento && (
                                    <div className="text-xs text-gray-500">
                                      Vence: {new Date(item.fecha_vencimiento).toLocaleDateString('es-ES')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-white rounded border">
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">Resumen</div>
                              <div className="mt-1">
                                <span className="text-gray-600">Cantidad solicitada: </span>
                                <span className="font-semibold">{solicitudSeleccionada.cantidad} unidades</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Total disponible: </span>
                                <span className={`font-semibold ${
                                  inventarioDisponible.reduce((total, item) => total + item.cantidad_disponible, 0) >= solicitudSeleccionada.cantidad
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}>
                                  {inventarioDisponible.reduce((total, item) => total + item.cantidad_disponible, 0)} unidades
                                </span>
                              </div>
                              <div className="mt-2">
                                {inventarioDisponible.reduce((total, item) => total + item.cantidad_disponible, 0) >= solicitudSeleccionada.cantidad ? (
                                  <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    ✅ Suficiente stock disponible
                                  </div>
                                ) : (
                                  <div className="flex items-center text-red-600 text-sm">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    ⚠️ Stock insuficiente ({inventarioDisponible.reduce((total, item) => total + item.cantidad_disponible, 0)} de {solicitudSeleccionada.cantidad} disponibles)
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No hay stock disponible de &quot;{solicitudSeleccionada.tipo_alimento}&quot; en el inventario</p>
                          <p className="text-xs text-gray-500 mt-1">La solicitud no puede ser satisfecha en este momento</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Ubicación */}
                {solicitudSeleccionada.latitud && solicitudSeleccionada.longitud && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Ubicación
                    </h4>
                    <div className="text-sm text-gray-700 mb-3">
                      Coordenadas: {solicitudSeleccionada.latitud.toFixed(6)}, {solicitudSeleccionada.longitud.toFixed(6)}
                    </div>
                    <iframe
                      title="Ubicación del solicitante"
                      className="w-full h-64 rounded border"
                      src={`https://maps.google.com/maps?q=${solicitudSeleccionada.latitud},${solicitudSeleccionada.longitud}&z=15&output=embed`}
                    ></iframe>
                  </div>
                )}

                {/* Acciones */}
                {solicitudSeleccionada.estado === 'pendiente' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Gestionar Solicitud</h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="comentario-admin" className="block text-sm font-medium text-gray-700 mb-2">
                          Comentario administrativo (opcional)
                        </label>
                        <textarea
                          id="comentario-admin"
                          value={comentarioAdmin}
                          onChange={(e) => setComentarioAdmin(e.target.value)}
                          placeholder="Agregar comentarios sobre la decisión..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => actualizarEstado(solicitudSeleccionada.id, 'aprobada')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Aprobar Solicitud</span>
                        </button>
                        <button
                          onClick={() => actualizarEstado(solicitudSeleccionada.id, 'rechazada')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar Solicitud</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
            duration={5000}
          />
        ))}
      </div>
    </DashboardLayout>
  );
}
