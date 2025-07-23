'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { 
  Search, 
  Filter, 
  Package, 
  Calendar, 
  Phone, 
  User, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Truck,
  Gift
} from 'lucide-react';

interface Donacion {
  id: number;
  user_id: string;
  nombre_donante: string;
  ruc_donante?: string;
  cedula_donante?: string;
  direccion_donante_completa?: string;
  telefono: string;
  email: string;
  representante_donante?: string;
  tipo_persona_donante: string;
  alimento_id?: number;
  tipo_producto: string;
  categoria_comida: string;
  es_producto_personalizado: boolean;
  cantidad: number;
  unidad_id: number;
  unidad_nombre: string;
  unidad_simbolo: string;
  fecha_vencimiento?: string;
  fecha_disponible: string;
  direccion_entrega: string;
  horario_preferido?: string;
  observaciones?: string;
  impacto_estimado_personas?: number;
  impacto_equivalente?: string;
  estado: 'Pendiente' | 'Recogida' | 'Entregada' | 'Cancelada';
  creado_en: string;
  actualizado_en: string;
  // Datos del alimento relacionado
  alimento?: {
    nombre: string;
    categoria: string;
  };
}

interface FiltroEstado {
  todos: boolean;
  Pendiente: boolean;
  Recogida: boolean;
  Entregada: boolean;
  Cancelada: boolean;
}

interface FiltroTipoPersona {
  todos: boolean;
  Natural: boolean;
  Juridica: boolean;
}

export default function AdminDonaciones() {
  const { supabase } = useSupabase();
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [donacionesFiltradas, setDonacionesFiltradas] = useState<Donacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>({
    todos: true,
    Pendiente: false,
    Recogida: false,
    Entregada: false,
    Cancelada: false
  });
  const [filtroTipoPersona, setFiltroTipoPersona] = useState<FiltroTipoPersona>({
    todos: true,
    Natural: false,
    Juridica: false
  });

  const cargarDonaciones = useCallback(async () => {
    setCargando(true);
    
    try {
      const { data: donaciones, error } = await supabase
        .from('donaciones')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      if (!donaciones || donaciones.length === 0) {
        setDonaciones([]);
        setCargando(false);
        return;
      }

      // Procesar donaciones con información de alimentos
      const donacionesConAlimentos = await Promise.all(
        donaciones.map(async (donacion) => {
          try {
            if (donacion.alimento_id) {
              const { data: alimento, error: alimentoError } = await supabase
                .from('alimentos')
                .select('nombre, categoria')
                .eq('id', donacion.alimento_id)
                .single();
              
              if (!alimentoError && alimento) {
                return { ...donacion, alimento };
              }
            }
            return donacion;
          } catch {
            return donacion;
          }
        })
      );
      
      setDonaciones(donacionesConAlimentos);
      
    } catch (error) {
      console.error('Error cargando donaciones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error: ${errorMessage}`);
    } finally {
      setCargando(false);
    }
  }, [supabase]);

  const aplicarFiltros = useCallback(() => {
    let filtradas = [...donaciones];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      filtradas = filtradas.filter(d => 
        d.nombre_donante?.toLowerCase().includes(terminoBusqueda) ||
        d.cedula_donante?.includes(terminoBusqueda) ||
        d.ruc_donante?.includes(terminoBusqueda) ||
        d.telefono?.includes(terminoBusqueda) ||
        d.email?.toLowerCase().includes(terminoBusqueda) ||
        d.tipo_producto?.toLowerCase().includes(terminoBusqueda) ||
        d.categoria_comida?.toLowerCase().includes(terminoBusqueda) ||
        d.alimento?.nombre?.toLowerCase().includes(terminoBusqueda)
      );
    }

    // Filtro por estado
    if (!filtroEstado.todos) {
      filtradas = filtradas.filter(d => {
        if (filtroEstado.Pendiente && d.estado === 'Pendiente') return true;
        if (filtroEstado.Recogida && d.estado === 'Recogida') return true;
        if (filtroEstado.Entregada && d.estado === 'Entregada') return true;
        if (filtroEstado.Cancelada && d.estado === 'Cancelada') return true;
        return false;
      });
    }

    // Filtro por tipo de persona
    if (!filtroTipoPersona.todos) {
      filtradas = filtradas.filter(d => {
        if (filtroTipoPersona.Natural && d.tipo_persona_donante === 'Natural') return true;
        if (filtroTipoPersona.Juridica && d.tipo_persona_donante === 'Juridica') return true;
        return false;
      });
    }

    setDonacionesFiltradas(filtradas);
  }, [donaciones, busqueda, filtroEstado, filtroTipoPersona]);

  useEffect(() => {
    cargarDonaciones();
    
    // Debug: Verificar estructura de la tabla
    const verificarTabla = async () => {
      try {
        const { data: estructura } = await supabase
          .from('donaciones')
          .select('*')
          .limit(1);
        
        console.log('Estructura de tabla donaciones:', estructura);
        
        // También verificar si existe la tabla alimentos
        const { data: alimentos } = await supabase
          .from('alimentos')
          .select('*')
          .limit(5);
        
        console.log('Datos de alimentos disponibles:', alimentos);
        
      } catch (error) {
        console.error('Error verificando estructura:', error);
      }
    };
    
    verificarTabla();
  }, [cargarDonaciones, supabase]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const cambiarFiltroEstado = (estado: keyof FiltroEstado) => {
    if (estado === 'todos') {
      setFiltroEstado({
        todos: true,
        Pendiente: false,
        Recogida: false,
        Entregada: false,
        Cancelada: false
      });
    } else {
      setFiltroEstado(prev => ({
        ...prev,
        todos: false,
        [estado]: !prev[estado]
      }));
    }
  };

  const cambiarFiltroTipoPersona = (tipo: keyof FiltroTipoPersona) => {
    if (tipo === 'todos') {
      setFiltroTipoPersona({
        todos: true,
        Natural: false,
        Juridica: false
      });
    } else {
      setFiltroTipoPersona(prev => ({
        ...prev,
        todos: false,
        [tipo]: !prev[tipo]
      }));
    }
  };

  const cambiarEstadoDonacion = async (id: number, nuevoEstado: Donacion['estado']) => {
    try {
      // Obtener la donación actual para procesamiento
      const donacionActual = donaciones.find(d => d.id === id);
      if (!donacionActual) {
        alert('Donación no encontrada');
        return;
      }

      // Actualizar estado en la base de datos
      const { error } = await supabase
        .from('donaciones')
        .update({ 
          estado: nuevoEstado,
          actualizado_en: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error actualizando estado:', error);
        alert(`Error actualizando estado: ${error.message}`);
        return;
      }

      // LÓGICA DE INTEGRACIÓN CON INVENTARIO Y MOVIMIENTOS
      if (nuevoEstado === 'Entregada' && donacionActual.estado === 'Recogida') {
        const productoId = await integrarConInventario(donacionActual);
        
        // REGISTRAR MOVIMIENTO CUANDO SE ENTREGA LA DONACIÓN
        if (productoId) {
          await registrarMovimientoDonacion(donacionActual, productoId);
        }
      }

      // Recargar datos solo si la actualización fue exitosa
      await cargarDonaciones();
      
      // Mostrar confirmación al usuario
      alert(`Donación ${nuevoEstado.toLowerCase()} exitosamente${nuevoEstado === 'Entregada' ? ' y agregada al inventario' : ''}`);
      
    } catch (error) {
      console.error('Error inesperado:', error);
      alert(`Error inesperado: ${error}`);
    }
  };

  // Nueva función para integrar con inventario
  const integrarConInventario = async (donacion: Donacion): Promise<number | null> => {
    try {
      console.log('Integrando donación con inventario:', donacion);

      const productoId = await obtenerOCrearProducto(donacion);
      const depositoId = await obtenerOCrearDeposito();
      await actualizarInventario(productoId, depositoId, donacion);

      return productoId; // Retornar el ID del producto para registrar movimiento
    } catch (error) {
      console.error('Error integrando con inventario:', error);
      alert(`Advertencia: Donación marcada como entregada, pero hubo un error al actualizar el inventario: ${error}`);
      return null;
    }
  };

  const obtenerOCrearProducto = async (donacion: Donacion): Promise<number> => {
    // Buscar producto existente
    const { data: productoExistente, error: errorBusqueda } = await supabase
      .from('productos_donados')
      .select('id_producto')
      .eq('nombre_producto', donacion.tipo_producto)
      .eq('descripcion', donacion.categoria_comida)
      .single();

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
      throw errorBusqueda;
    }

    if (productoExistente) {
      return productoExistente.id_producto;
    }

    // Crear producto nuevo
    const { data: nuevoProducto, error: errorCreacion } = await supabase
      .from('productos_donados')
      .insert({
        nombre_producto: donacion.tipo_producto,
        descripcion: donacion.categoria_comida,
        unidad_medida: donacion.unidad_simbolo,
        fecha_caducidad: donacion.fecha_vencimiento || null,
        fecha_donacion: new Date().toISOString()
      })
      .select('id_producto')
      .single();

    if (errorCreacion) {
      throw errorCreacion;
    }
    
    return nuevoProducto.id_producto;
  };

  const obtenerOCrearDeposito = async (): Promise<string> => {
    // Buscar depósito principal
    const { data: depositoPrincipal, error: errorDeposito } = await supabase
      .from('depositos')
      .select('id_deposito')
      .limit(1)
      .single();

    if (!errorDeposito) {
      return depositoPrincipal.id_deposito;
    }

    // Crear depósito por defecto
    console.warn('No se encontró depósito, creando uno por defecto');
    const { data: nuevoDeposito, error: errorNuevoDeposito } = await supabase
      .from('depositos')
      .insert({
        nombre: 'Depósito Principal',
        descripcion: 'Depósito principal para donaciones'
      })
      .select('id_deposito')
      .single();
      
    if (errorNuevoDeposito) {
      throw errorNuevoDeposito;
    }
    
    return nuevoDeposito.id_deposito;
  };

  const actualizarInventario = async (productoId: number, depositoId: string, donacion: Donacion) => {
    // Verificar inventario existente
    const { data: inventarioExistente, error: errorInventario } = await supabase
      .from('inventario')
      .select('id_inventario, cantidad_disponible')
      .eq('id_producto', productoId)
      .eq('id_deposito', depositoId)
      .single();

    if (errorInventario && errorInventario.code !== 'PGRST116') {
      throw errorInventario;
    }

    if (inventarioExistente) {
      // Actualizar cantidad existente
      const { error: errorActualizacion } = await supabase
        .from('inventario')
        .update({
          cantidad_disponible: inventarioExistente.cantidad_disponible + donacion.cantidad,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_inventario', inventarioExistente.id_inventario);

      if (errorActualizacion) {
        throw errorActualizacion;
      }
      
      console.log(`Inventario actualizado: +${donacion.cantidad} ${donacion.unidad_simbolo} de ${donacion.tipo_producto}`);
    } else {
      // Crear nueva entrada en inventario
      const { error: errorNuevoInventario } = await supabase
        .from('inventario')
        .insert({
          id_deposito: depositoId,
          id_producto: productoId,
          cantidad_disponible: donacion.cantidad,
          fecha_actualizacion: new Date().toISOString()
        });

      if (errorNuevoInventario) {
        throw errorNuevoInventario;
      }
      
      console.log(`Nuevo item agregado al inventario: ${donacion.cantidad} ${donacion.unidad_simbolo} de ${donacion.tipo_producto}`);
    }
  };

  // Nueva función para registrar movimientos de donaciones entregadas
  const registrarMovimientoDonacion = async (donacion: Donacion, productoId: number) => {
    try {
      console.log('Registrando movimiento de donación entregada:', donacion);

      // Obtener información del administrador actual (quien entrega)
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
          id_donante: donacion.user_id, // El donante original
          id_solicitante: user.id, // El admin que recibe la donación
          estado_movimiento: 'donado',
          observaciones: `Donación entregada - ${donacion.tipo_producto} (${donacion.cantidad} ${donacion.unidad_simbolo})`
        })
        .select('id_movimiento')
        .single();

      if (errorCabecera) {
        console.error('Error creando cabecera de movimiento:', errorCabecera);
        return;
      }

      // 2. Crear detalle del movimiento
      const { error: errorDetalle } = await supabase
        .from('movimiento_inventario_detalle')
        .insert({
          id_movimiento: movimientoCabecera.id_movimiento,
          id_producto: productoId,
          cantidad: donacion.cantidad,
          tipo_transaccion: 'ingreso',
          rol_usuario: 'donante',
          observacion_detalle: `Ingreso por donación entregada - ${donacion.tipo_producto}`
        });

      if (errorDetalle) {
        console.error('Error creando detalle de movimiento:', errorDetalle);
      } else {
        console.log('Movimiento de donación registrado exitosamente');
      }
    } catch (error) {
      console.error('Error registrando movimiento de donación:', error);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Recogida': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Entregada': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelada': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return <Clock className="w-4 h-4" />;
      case 'Recogida': return <Truck className="w-4 h-4" />;
      case 'Entregada': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelada': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTipoPersonaIcon = (tipo: string) => {
    return tipo === 'Juridica' ? <Building className="w-4 h-4" /> : <User className="w-4 h-4" />;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const esProximoAVencer = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diasDiferencia = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    return diasDiferencia <= 7 && diasDiferencia >= 0; // Próximo a vencer en 7 días
  };

  const estaVencido = (fechaVencimiento: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    return vencimiento < hoy;
  };

  const getEstiloFechaVencimiento = (fechaVencimiento: string) => {
    if (estaVencido(fechaVencimiento)) {
      return {
        textColor: 'text-red-600',
        iconColor: 'text-red-500',
        texto: 'VENCIDO: '
      };
    }
    if (esProximoAVencer(fechaVencimiento)) {
      return {
        textColor: 'text-orange-600',
        iconColor: 'text-orange-500',
        texto: 'VENCE PRONTO: '
      };
    }
    return {
      textColor: 'text-gray-500',
      iconColor: 'text-gray-400',
      texto: 'Vence: '
    };
  };

  const getContadorPorEstado = () => {
    const contador = {
      TOTAL: donaciones.length,
      Pendiente: 0,
      Recogida: 0,
      Entregada: 0,
      Cancelada: 0
    };

    donaciones.forEach(d => {
      contador[d.estado]++;
    });

    return contador;
  };

  const getContadorPorTipo = () => {
    const contador = {
      Natural: 0,
      Juridica: 0
    };

    donaciones.forEach(d => {
      contador[d.tipo_persona_donante as keyof typeof contador]++;
    });

    return contador;
  };

  const contadorEstado = getContadorPorEstado();
  const contadorTipo = getContadorPorTipo();

  // Función para verificar esquema de base de datos
  const verificarEsquemaInventario = async () => {
    try {
      console.log('=== VERIFICANDO ESQUEMA DE INVENTARIO ===');
      
      // Verificar tabla productos_donados
      const { data: productos, error: errorProductos } = await supabase
        .from('productos_donados')
        .select('*')
        .limit(1);
      console.log('Tabla productos_donados:', productos, errorProductos);
      
      // Verificar tabla depositos
      const { data: depositos, error: errorDepositos } = await supabase
        .from('depositos')
        .select('*')
        .limit(1);
      console.log('Tabla depositos:', depositos, errorDepositos);
      
      // Verificar tabla inventario
      const { data: inventario, error: errorInventario } = await supabase
        .from('inventario')
        .select('*')
        .limit(1);
      console.log('Tabla inventario:', inventario, errorInventario);
      
      const errores = [];
      if (errorProductos) errores.push('productos_donados');
      if (errorDepositos) errores.push('depositos');
      if (errorInventario) errores.push('inventario');
      
      if (errores.length > 0) {
        alert(`⚠️ Tablas faltantes para integración: ${errores.join(', ')}\nLa integración automática no funcionará hasta que se creen estas tablas.`);
      } else {
        alert('✅ Todas las tablas necesarias para la integración existen.');
      }
      
    } catch (error) {
      console.error('Error verificando esquema:', error);
      alert(`Error verificando esquema: ${error}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Donaciones</h1>
            <p className="text-sm text-gray-600 mt-1">Administra todas las donaciones del sistema</p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{contadorEstado.TOTAL}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{contadorEstado.Pendiente}</div>
              <div className="text-xs text-yellow-600">Pendientes</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{contadorEstado.Recogida}</div>
              <div className="text-xs text-blue-600">Recogidas</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{contadorEstado.Entregada}</div>
              <div className="text-xs text-green-600">Entregadas</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{contadorEstado.Cancelada}</div>
              <div className="text-xs text-red-600">Canceladas</div>
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
                placeholder="Buscar por donante, producto, email, teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Filtros de estado */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Estado:</span>
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
                  {key === 'todos' ? 'Todos' : key}
                </button>
              ))}
            </div>

            {/* Filtros de tipo de persona */}
            <div className="flex items-center space-x-2">
              <User className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              {Object.entries(filtroTipoPersona).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => cambiarFiltroTipoPersona(key as keyof FiltroTipoPersona)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {key === 'todos' ? 'Todos' : key}
                </button>
              ))}
            </div>
          </div>

          {/* Indicador de resultados */}
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {donacionesFiltradas.length} de {donaciones.length} donaciones
            {donaciones.length === 0 && (
              <span className="ml-2 text-red-600">(No hay donaciones en la base de datos)</span>
            )}
          </div>
        </div>

        {/* Tabla de donaciones */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando donaciones...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donacionesFiltradas.map((donacion) => (
                    <tr key={donacion.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              {getTipoPersonaIcon(donacion.tipo_persona_donante)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {donacion.nombre_donante || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donacion.tipo_persona_donante === 'Juridica' ? donacion.ruc_donante : donacion.cedula_donante}
                            </div>
                            <div className="flex items-center mt-1">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="text-xs text-gray-500">{donacion.telefono}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {donacion.alimento?.nombre || donacion.tipo_producto}
                            </div>
                            <div className="text-sm text-gray-500">
                              {donacion.categoria_comida}
                            </div>
                            {donacion.es_producto_personalizado && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                                Personalizado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{donacion.cantidad}</span>
                          <span className="text-gray-500 ml-1">{donacion.unidad_simbolo}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {donacion.unidad_nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-green-500" />
                            <span className="text-xs">Disponible: {formatearFecha(donacion.fecha_disponible)}</span>
                          </div>
                          {donacion.fecha_vencimiento && (() => {
                            const estilo = getEstiloFechaVencimiento(donacion.fecha_vencimiento);
                            return (
                              <div className={`flex items-center mt-1 ${estilo.textColor}`}>
                                <AlertCircle className={`w-4 h-4 mr-1 ${estilo.iconColor}`} />
                                <span className="text-xs">
                                  {estilo.texto}{formatearFecha(donacion.fecha_vencimiento)}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(donacion.estado)}`}>
                          {getEstadoIcon(donacion.estado)}
                          <span className="ml-1">{donacion.estado}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {donacion.impacto_estimado_personas && (
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-1 text-blue-500" />
                              <span className="font-medium">{donacion.impacto_estimado_personas}</span>
                              <span className="text-gray-500 ml-1">personas</span>
                            </div>
                            {donacion.impacto_equivalente && (
                              <div className="text-xs text-gray-500 mt-1">
                                {donacion.impacto_equivalente}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          {donacion.estado === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => cambiarEstadoDonacion(donacion.id, 'Recogida')}
                                className="text-blue-600 hover:text-blue-500 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 text-xs transition-colors"
                                title="Marcar como Recogida"
                              >
                                <Truck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => cambiarEstadoDonacion(donacion.id, 'Cancelada')}
                                className="text-red-600 hover:text-red-500 px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-xs transition-colors"
                                title="Cancelar"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {donacion.estado === 'Recogida' && (
                            <button
                              onClick={() => cambiarEstadoDonacion(donacion.id, 'Entregada')}
                              className="text-green-600 hover:text-green-500 px-2 py-1 rounded border border-green-200 hover:bg-green-50 text-xs transition-colors"
                              title="Marcar como Entregada (se agregará al inventario)"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {donacion.estado === 'Entregada' && (
                            <span className="text-green-600 px-2 py-1 rounded border border-green-200 bg-green-50 text-xs">
                              ✓ En inventario
                            </span>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-500 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-xs transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {donacionesFiltradas.length === 0 && donaciones.length > 0 && (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No se encontraron donaciones con los filtros aplicados</p>
                  <button
                    onClick={() => {
                      setBusqueda('');
                      setFiltroEstado({ todos: true, Pendiente: false, Recogida: false, Entregada: false, Cancelada: false });
                      setFiltroTipoPersona({ todos: true, Natural: false, Juridica: false });
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {donaciones.length === 0 && (
                <div className="p-8 text-center">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 mb-2">No hay donaciones registradas en el sistema</p>
                  <p className="text-sm text-gray-400">
                    Las donaciones aparecerán aquí una vez que se registren en la base de datos.
                  </p>
                  <div className="flex gap-2 justify-center mt-4">
                    <button
                      onClick={cargarDonaciones}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Recargar datos
                    </button>
                    <button
                      onClick={verificarEsquemaInventario}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      🔍 Verificar Integración
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-600">Pendientes</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorEstado.Pendiente}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Recogidas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorEstado.Recogida}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">Entregadas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorEstado.Entregada}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-600">Canceladas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorEstado.Cancelada}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipo de Donante</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">Personas Naturales</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorTipo.Natural}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Building className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-600">Personas Jurídicas</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{contadorTipo.Juridica}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
