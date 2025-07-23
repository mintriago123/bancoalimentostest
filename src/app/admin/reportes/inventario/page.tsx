'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { 
  Search, 
  Filter, 
  Package, 
  Warehouse, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Minus,
  Eye,
  RefreshCw,
  Calendar
} from 'lucide-react';

interface Inventario {
  id_inventario: string;
  id_deposito: string;
  id_producto: string;
  cantidad_disponible: number;
  fecha_actualizacion: string;
  deposito: {
    nombre: string;
    descripcion: string;
  };
  producto: {
    nombre_producto: string;
    descripcion: string;
    unidad_medida: string;
    fecha_caducidad: string;
    fecha_donacion: string;
  };
}

interface Deposito {
  id_deposito: string;
  nombre: string;
  descripcion: string;
}

export default function AdminInventario() {
  const { supabase } = useSupabase();
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [inventarioFiltrado, setInventarioFiltrado] = useState<Inventario[]>([]);
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [depositoSeleccionado, setDepositoSeleccionado] = useState<string>('todos');
  const [filtroStock, setFiltroStock] = useState<string>('todos'); // todos, bajo, normal, alto

  const cargarInventario = useCallback(async () => {
    setCargando(true);
    
    try {
      const { data, error } = await supabase
        .from('inventario')
        .select(`
          *,
          depositos!inventario_id_deposito_fkey(
            nombre,
            descripcion
          ),
          productos_donados!inventario_id_producto_fkey(
            nombre_producto,
            descripcion,
            unidad_medida,
            fecha_caducidad,
            fecha_donacion
          )
        `)
        .order('fecha_actualizacion', { ascending: false });

      if (error) {
        console.error('Error cargando inventario:', error);
        alert(`Error cargando inventario: ${error.message}`);
        setInventario([]);
      } else if (data) {
        // Mapear los datos para que coincidan con la interfaz esperada
        const inventarioMapeado = data.map(item => ({
          ...item,
          deposito: Array.isArray(item.depositos) ? item.depositos[0] : item.depositos || { nombre: 'Sin depósito', descripcion: '' },
          producto: Array.isArray(item.productos_donados) ? item.productos_donados[0] : item.productos_donados || { 
            nombre_producto: 'Sin nombre', 
            descripcion: '', 
            unidad_medida: '',
            fecha_caducidad: '',
            fecha_donacion: ''
          }
        }));
        setInventario(inventarioMapeado);
      } else {
        setInventario([]);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setInventario([]);
    } finally {
      setCargando(false);
    }
  }, [supabase]);

  const cargarDepositos = useCallback(async () => {
    const { data, error } = await supabase
      .from('depositos')
      .select('*')
      .order('nombre');

    if (!error && data) {
      setDepositos(data);
    }
  }, [supabase]);

  const aplicarFiltros = useCallback(() => {
    let filtrado = [...inventario];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      filtrado = filtrado.filter(item => 
        item.producto.nombre_producto?.toLowerCase().includes(terminoBusqueda) ||
        item.producto.descripcion?.toLowerCase().includes(terminoBusqueda) ||
        item.deposito.nombre?.toLowerCase().includes(terminoBusqueda)
      );
    }

    // Filtro por depósito
    if (depositoSeleccionado !== 'todos') {
      filtrado = filtrado.filter(item => item.id_deposito === depositoSeleccionado);
    }

    // Filtro por nivel de stock
    if (filtroStock !== 'todos') {
      filtrado = filtrado.filter(item => {
        const cantidad = item.cantidad_disponible;
        switch (filtroStock) {
          case 'bajo': return cantidad <= 10;
          case 'normal': return cantidad > 10 && cantidad <= 50;
          case 'alto': return cantidad > 50;
          default: return true;
        }
      });
    }

    setInventarioFiltrado(filtrado);
  }, [inventario, busqueda, depositoSeleccionado, filtroStock]);

  useEffect(() => {
    cargarInventario();
    cargarDepositos();
    
    // Debug: Verificar estructura de las tablas
    const verificarEstructura = async () => {
      try {
        console.log('=== VERIFICANDO ESTRUCTURA DE TABLAS ===');
        
        // Verificar tabla inventario
        const { data: inventarioTest, error: errorInventario } = await supabase
          .from('inventario')
          .select('*')
          .limit(1);
        
        console.log('Estructura de inventario:', inventarioTest);
        if (errorInventario) console.error('Error en inventario:', errorInventario);
        
        // Verificar tabla depositos
        const { data: depositosTest, error: errorDepositos } = await supabase
          .from('depositos')
          .select('*')
          .limit(1);
        
        console.log('Estructura de depositos:', depositosTest);
        if (errorDepositos) console.error('Error en depositos:', errorDepositos);
        
        // Verificar tabla productos_donados
        const { data: productosTest, error: errorProductos } = await supabase
          .from('productos_donados')
          .select('*')
          .limit(1);
        
        console.log('Estructura de productos_donados:', productosTest);
        if (errorProductos) console.error('Error en productos_donados:', errorProductos);
        
        // Verificar JOIN completo
        const { data: joinTest, error: errorJoin } = await supabase
          .from('inventario')
          .select(`
            id_inventario,
            cantidad_disponible,
            depositos!inventario_id_deposito_fkey(nombre),
            productos_donados!inventario_id_producto_fkey(nombre_producto)
          `)
          .limit(1);
        
        console.log('Test de JOIN:', joinTest);
        if (errorJoin) console.error('Error en JOIN:', errorJoin);
        
      } catch (error) {
        console.error('Error verificando estructura:', error);
      }
    };
    
    verificarEstructura();
  }, [cargarInventario, cargarDepositos]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const actualizarCantidad = async (idInventario: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 0) return;

    try {
      // Obtener el item actual para calcular la diferencia
      const itemActual = inventario.find(item => item.id_inventario === idInventario);
      if (!itemActual) {
        alert('Item de inventario no encontrado');
        return;
      }

      const cantidadAnterior = itemActual.cantidad_disponible;
      const diferencia = nuevaCantidad - cantidadAnterior;

      // Actualizar la cantidad en inventario
      const { error } = await supabase
        .from('inventario')
        .update({ 
          cantidad_disponible: nuevaCantidad,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_inventario', idInventario);

      if (error) {
        console.error('Error actualizando inventario:', error);
        alert(`Error actualizando inventario: ${error.message}`);
        return;
      }

      // Registrar el movimiento si hay diferencia
      if (diferencia !== 0) {
        await registrarMovimientoAjuste(itemActual, diferencia);
      }

      // Recargar inventario
      await cargarInventario();
      
    } catch (error) {
      console.error('Error inesperado:', error);
      alert(`Error inesperado: ${error}`);
    }
  };

  // Nueva función para registrar movimientos de ajustes manuales
  const registrarMovimientoAjuste = async (item: Inventario, diferencia: number) => {
    try {
      console.log('Registrando ajuste de inventario:', { item, diferencia });

      // Obtener información del usuario actual (administrador)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('No se pudo obtener el usuario para el movimiento de ajuste');
        return;
      }

      // 1. Crear cabecera del movimiento
      const { data: movimientoCabecera, error: errorCabecera } = await supabase
        .from('movimiento_inventario_cabecera')
        .insert({
          fecha_movimiento: new Date().toISOString(),
          id_donante: user.id, // Admin que hace el ajuste
          id_solicitante: user.id, // Mismo admin
          estado_movimiento: 'completado',
          observaciones: `Ajuste manual de inventario - ${item.producto.nombre_producto} (${diferencia > 0 ? '+' : ''}${diferencia} unidades)`
        })
        .select('id_movimiento')
        .single();

      if (errorCabecera) {
        console.error('Error creando cabecera de movimiento de ajuste:', errorCabecera);
        return;
      }

      // 2. Crear detalle del movimiento
      const tipoTransaccion = diferencia > 0 ? 'ingreso' : 'egreso';
      const cantidadAbsoluta = Math.abs(diferencia);

      const { error: errorDetalle } = await supabase
        .from('movimiento_inventario_detalle')
        .insert({
          id_movimiento: movimientoCabecera.id_movimiento,
          id_producto: item.id_producto,
          cantidad: cantidadAbsoluta,
          tipo_transaccion: tipoTransaccion,
          rol_usuario: 'distribuidor',
          observacion_detalle: `Ajuste manual de inventario - ${tipoTransaccion === 'ingreso' ? 'Incremento' : 'Reducción'} de ${cantidadAbsoluta} unidades`
        });

      if (errorDetalle) {
        console.error('Error creando detalle de movimiento de ajuste:', errorDetalle);
      } else {
        console.log('Movimiento de ajuste registrado exitosamente');
      }
    } catch (error) {
      console.error('Error registrando movimiento de ajuste:', error);
    }
  };

  const getStockColor = (cantidad: number) => {
    if (cantidad <= 10) return 'text-red-600 bg-red-50 border-red-200';
    if (cantidad <= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStockIcon = (cantidad: number) => {
    if (cantidad <= 10) return <AlertTriangle className="w-4 h-4" />;
    if (cantidad <= 50) return <TrendingDown className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadisticas = () => {
    const total = inventario.length;
    const stockBajo = inventario.filter(item => item.cantidad_disponible <= 10).length;
    const stockNormal = inventario.filter(item => item.cantidad_disponible > 10 && item.cantidad_disponible <= 50).length;
    const stockAlto = inventario.filter(item => item.cantidad_disponible > 50).length;
    const cantidadTotal = inventario.reduce((sum, item) => sum + item.cantidad_disponible, 0);

    return { total, stockBajo, stockNormal, stockAlto, cantidadTotal };
  };

  const estadisticas = getEstadisticas();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
            <p className="text-sm text-gray-600 mt-1">Administra el stock de productos en todos los depósitos</p>
          </div>
          
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{estadisticas.total}</div>
              <div className="text-xs text-gray-600">Productos</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{estadisticas.stockBajo}</div>
              <div className="text-xs text-red-600">Stock Bajo</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{estadisticas.stockNormal}</div>
              <div className="text-xs text-yellow-600">Stock Normal</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{estadisticas.stockAlto}</div>
              <div className="text-xs text-green-600">Stock Alto</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.cantidadTotal}</div>
              <div className="text-xs text-blue-600">Total Unidades</div>
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
                placeholder="Buscar productos, depósitos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por depósito */}
            <div className="flex items-center space-x-2">
              <Warehouse className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Depósito:</span>
              <select
                value={depositoSeleccionado}
                onChange={(e) => setDepositoSeleccionado(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              >
                <option value="todos">Todos</option>
                {depositos.map((deposito) => (
                  <option key={deposito.id_deposito} value={deposito.id_deposito}>
                    {deposito.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por nivel de stock */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-500 w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Stock:</span>
              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
              >
                <option value="todos">Todos</option>
                <option value="bajo">Bajo (≤10)</option>
                <option value="normal">Normal (11-50)</option>
                <option value="alto">Alto (&gt;50)</option>
              </select>
            </div>

            {/* Botón actualizar */}
            <button
              onClick={cargarInventario}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>

          {/* Indicador de resultados */}
          <div className="mt-2 text-sm text-gray-600">
            Mostrando {inventarioFiltrado.length} de {inventario.length} productos
          </div>
        </div>

        {/* Tabla de inventario */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando inventario...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Depósito
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventarioFiltrado.map((item) => (
                    <tr key={item.id_inventario} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="w-10 h-10 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.producto.nombre_producto || 'Sin nombre'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.producto.descripcion || 'Sin descripción'}
                            </div>
                            <div className="text-xs text-gray-400">
                              Unidad: {item.producto.unidad_medida || 'No especificada'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Warehouse className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.deposito.nombre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.deposito.descripcion || 'Sin descripción'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStockColor(item.cantidad_disponible)}`}>
                          {getStockIcon(item.cantidad_disponible)}
                          <span className="ml-2">{item.cantidad_disponible}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1 text-green-500" />
                            <span className="text-xs">Donación: {formatearFecha(item.producto.fecha_donacion)}</span>
                          </div>
                          {item.producto.fecha_caducidad && (
                            <div className="flex items-center mt-1">
                              <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                              <span className="text-xs">Caduca: {formatearFecha(item.producto.fecha_caducidad)}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            Actualizado: {formatearFecha(item.fecha_actualizacion)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => actualizarCantidad(item.id_inventario, item.cantidad_disponible - 1)}
                            disabled={item.cantidad_disponible <= 0}
                            className="text-red-600 hover:text-red-500 px-2 py-1 rounded border border-red-200 hover:bg-red-50 text-xs transition-colors disabled:opacity-50"
                            title="Reducir cantidad"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => actualizarCantidad(item.id_inventario, item.cantidad_disponible + 1)}
                            className="text-green-600 hover:text-green-500 px-2 py-1 rounded border border-green-200 hover:bg-green-50 text-xs transition-colors"
                            title="Aumentar cantidad"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
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
              
              {inventarioFiltrado.length === 0 && inventario.length > 0 && (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No se encontraron productos con los filtros aplicados</p>
                  <button
                    onClick={() => {
                      setBusqueda('');
                      setDepositoSeleccionado('todos');
                      setFiltroStock('todos');
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}

              {inventario.length === 0 && (
                <div className="p-8 text-center">
                  <Warehouse className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No hay productos en el inventario</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resumen por depósito */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depositos.map((deposito) => {
            const productosEnDeposito = inventario.filter(item => item.id_deposito === deposito.id_deposito);
            const totalProductos = productosEnDeposito.length;
            const totalUnidades = productosEnDeposito.reduce((sum, item) => sum + item.cantidad_disponible, 0);
            const stockBajo = productosEnDeposito.filter(item => item.cantidad_disponible <= 10).length;

            return (
              <div key={deposito.id_deposito} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{deposito.nombre}</h3>
                  <Warehouse className="w-6 h-6 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Productos únicos</span>
                    <span className="text-sm font-medium text-gray-900">{totalProductos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total unidades</span>
                    <span className="text-sm font-medium text-gray-900">{totalUnidades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Productos con stock bajo</span>
                    <span className={`text-sm font-medium ${stockBajo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stockBajo}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
