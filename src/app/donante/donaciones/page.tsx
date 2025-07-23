'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import DashboardLayout from '@/app/components/DashboardLayout';
import { Eye, Edit, Trash2, Clock, CheckCircle, XCircle, Calendar, Heart, Package, MapPin, Phone, Mail } from 'lucide-react';

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
  tipo_persona_donante?: string;
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
}

export default function MisDonacionesPage() {
  const { supabase, user } = useSupabase();
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(false);
  const [donacionAEditar, setDonacionAEditar] = useState<Donacion | null>(null);
  const [viendoDetalle, setViendoDetalle] = useState(false);
  const [donacionDetalle, setDonacionDetalle] = useState<Donacion | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const cargarMisDonaciones = useCallback(async () => {
    try {
      setCargando(true);
      
      if (!user?.id) {
        console.log('No hay usuario autenticado');
        return;
      }

      console.log('Cargando donaciones para usuario:', user.id);
      
      const { data, error } = await supabase
        .from('donaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error en query:', error);
        throw error;
      }
      
      console.log('Donaciones cargadas:', data?.length || 0);
      setDonaciones(data || []);
    } catch (error) {
      console.error('Error al cargar donaciones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje(`Error al cargar las donaciones: ${errorMessage}`);
      setTimeout(() => setMensaje(''), 3000);
    } finally {
      setCargando(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (user) cargarMisDonaciones();
  }, [cargarMisDonaciones, user]);

  const eliminarDonacion = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta donación?')) return;
    
    console.log('Intentando eliminar donación:', { id, userId: user?.id });
    
    try {
      // Verificar que el usuario esté autenticado
      if (!user?.id) {
        setMensaje('Usuario no autenticado.');
        return;
      }

      // Primero verificar que la donación pertenece al usuario
      const { data: donacionExistente, error: errorVerificar } = await supabase
        .from('donaciones')
        .select('id, user_id, estado')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (errorVerificar) {
        console.error('Error al verificar donación:', errorVerificar);
        setMensaje('Error al verificar la donación.');
        return;
      }

      if (!donacionExistente) {
        setMensaje('No tienes permiso para eliminar esta donación.');
        return;
      }

      if (donacionExistente.estado !== 'Pendiente') {
        setMensaje('Solo se pueden eliminar donaciones pendientes.');
        return;
      }

      // Proceder con la eliminación
      const { error } = await supabase
        .from('donaciones')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error en delete:', error);
        throw error;
      }

      console.log('Donación eliminada exitosamente');
      await cargarMisDonaciones();
      setMensaje('Donación eliminada con éxito.');
      setTimeout(() => setMensaje(''), 2000);
    } catch (error) {
      console.error('Error al eliminar donación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje(`Error al eliminar la donación: ${errorMessage}`);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const actualizarDonacion = async () => {
    if (!donacionAEditar) return;
    
    console.log('Intentando actualizar donación:', { 
      id: donacionAEditar.id, 
      userId: user?.id,
      estado: donacionAEditar.estado 
    });

    try {
      // Verificar que el usuario esté autenticado
      if (!user?.id) {
        setMensaje('Usuario no autenticado.');
        return;
      }

      // Verificar que la donación pertenece al usuario y está pendiente
      if (donacionAEditar.estado !== 'Pendiente') {
        setMensaje('Solo se pueden editar donaciones pendientes.');
        return;
      }

      const { data, error } = await supabase
        .from('donaciones')
        .update({
          tipo_producto: donacionAEditar.tipo_producto,
          categoria_comida: donacionAEditar.categoria_comida,
          cantidad: donacionAEditar.cantidad,
          fecha_disponible: donacionAEditar.fecha_disponible,
          direccion_entrega: donacionAEditar.direccion_entrega,
          horario_preferido: donacionAEditar.horario_preferido,
          observaciones: donacionAEditar.observaciones,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id', donacionAEditar.id)
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Error en update:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Donación actualizada exitosamente:', data[0]);
        setDonaciones(donaciones.map(d => d.id === donacionAEditar.id ? data[0] : d));
        setMensaje('Donación actualizada con éxito.');
        setEditando(false);
      } else {
        console.log('No se retornaron datos después de la actualización');
        // Recargar todas las donaciones para asegurar consistencia
        await cargarMisDonaciones();
        setMensaje('Donación actualizada.');
        setEditando(false);
      }
      
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al actualizar la donación:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setMensaje(`Error al actualizar la donación: ${errorMessage}`);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (donacionAEditar) {
      setDonacionAEditar({ 
        ...donacionAEditar, 
        [name]: name === 'cantidad' ? parseFloat(value) || 0 : value 
      });
    }
  };

  const getEstadoBadge = (estado: string) => {
    const base = 'px-3 py-1 text-xs font-semibold rounded-full border ';
    switch (estado) {
      case 'Pendiente':
        return base + 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Recogida':
        return base + 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Entregada':
        return base + 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelada':
        return base + 'bg-red-100 text-red-800 border-red-300';
      default:
        return base + 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return <Clock className="w-4 h-4" />;
      case 'Recogida': return <Calendar className="w-4 h-4" />;
      case 'Entregada': return <CheckCircle className="w-4 h-4" />;
      case 'Cancelada': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const formatearFechaSolo = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  const donacionesFiltradas = donaciones.filter(donacion => 
    filtroEstado === 'todos' || donacion.estado === filtroEstado
  );

  const estadisticas = {
    total: donaciones.length,
    pendientes: donaciones.filter(d => d.estado === 'Pendiente').length,
    recogidas: donaciones.filter(d => d.estado === 'Recogida').length,
    entregadas: donaciones.filter(d => d.estado === 'Entregada').length,
    canceladas: donaciones.filter(d => d.estado === 'Cancelada').length,
    impactoTotal: donaciones.reduce((acc, d) => acc + (d.impacto_estimado_personas || 0), 0)
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Mis Donaciones</h1>
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-lg font-semibold text-gray-700">
              {estadisticas.total} donaciones realizadas
            </span>
          </div>
        </div>

        {mensaje && (
          <div className="text-sm text-blue-600 bg-blue-100 p-3 rounded-md border border-blue-200">
            {mensaje}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-800">{estadisticas.pendientes}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Recogidas</p>
                <p className="text-2xl font-bold text-blue-800">{estadisticas.recogidas}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Entregadas</p>
                <p className="text-2xl font-bold text-green-800">{estadisticas.entregadas}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Canceladas</p>
                <p className="text-2xl font-bold text-red-800">{estadisticas.canceladas}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Impacto Total</p>
                <p className="text-2xl font-bold text-purple-800">{estadisticas.impactoTotal}</p>
                <p className="text-xs text-purple-600">personas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Recogida">Recogidas</option>
              <option value="Entregada">Entregadas</option>
              <option value="Cancelada">Canceladas</option>
            </select>
            <span className="text-sm text-gray-500">
              Mostrando {donacionesFiltradas.length} de {donaciones.length} donaciones
            </span>
          </div>
        </div>

        {/* Modal de Edición */}
        {editando && donacionAEditar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Editar Donación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto</label>
                  <input
                    type="text"
                    name="tipo_producto"
                    value={donacionAEditar.tipo_producto}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    name="categoria_comida"
                    value={donacionAEditar.categoria_comida}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  >
                    <option value="Verduras">Verduras</option>
                    <option value="Frutas">Frutas</option>
                    <option value="Carnes">Carnes</option>
                    <option value="Lácteos">Lácteos</option>
                    <option value="Granos">Granos</option>
                    <option value="Enlatados">Enlatados</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={donacionAEditar.cantidad}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Disponible</label>
                  <input
                    type="date"
                    name="fecha_disponible"
                    value={donacionAEditar.fecha_disponible}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    name="direccion_entrega"
                    value={donacionAEditar.direccion_entrega}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario Preferido</label>
                  <input
                    type="text"
                    name="horario_preferido"
                    value={donacionAEditar.horario_preferido || ''}
                    onChange={handleChange}
                    placeholder="Ej: 9:00 AM - 5:00 PM"
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={donacionAEditar.observaciones || ''}
                    onChange={handleChange}
                    rows={3}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={actualizarDonacion}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex-1"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalle */}
        {viendoDetalle && donacionDetalle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Detalles de la Donación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Información del Producto</h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <p><span className="font-medium">Tipo:</span> {donacionDetalle.tipo_producto}</p>
                      <p><span className="font-medium">Categoría:</span> {donacionDetalle.categoria_comida}</p>
                      <p><span className="font-medium">Cantidad:</span> {donacionDetalle.cantidad} {donacionDetalle.unidad_simbolo}</p>
                      {donacionDetalle.fecha_vencimiento && (
                        <p><span className="font-medium">Vencimiento:</span> {formatearFechaSolo(donacionDetalle.fecha_vencimiento)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Información de Entrega</h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <p><span className="font-medium">Fecha disponible:</span> {formatearFechaSolo(donacionDetalle.fecha_disponible)}</p>
                      <p><span className="font-medium">Dirección:</span> {donacionDetalle.direccion_entrega}</p>
                      {donacionDetalle.horario_preferido && (
                        <p><span className="font-medium">Horario:</span> {donacionDetalle.horario_preferido}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Estado e Impacto</h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex items-center space-x-2">
                        {getEstadoIcon(donacionDetalle.estado)}
                        <span className={getEstadoBadge(donacionDetalle.estado)}>{donacionDetalle.estado}</span>
                      </div>
                      {donacionDetalle.impacto_estimado_personas && (
                        <p><span className="font-medium">Impacto estimado:</span> {donacionDetalle.impacto_estimado_personas} personas</p>
                      )}
                      {donacionDetalle.impacto_equivalente && (
                        <p><span className="font-medium">Equivalente:</span> {donacionDetalle.impacto_equivalente}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Contacto</h4>
                    <div className="bg-gray-50 p-3 rounded-md space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{donacionDetalle.telefono}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{donacionDetalle.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {donacionDetalle.observaciones && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-2">Observaciones</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p>{donacionDetalle.observaciones}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViendoDetalle(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Donaciones */}
        {cargando ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando donaciones...</p>
          </div>
        ) : donacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto" />
            <p className="text-gray-500 mt-2">
              {filtroEstado === 'todos' 
                ? 'No has registrado ninguna donación aún.' 
                : `No tienes donaciones con estado "${filtroEstado}".`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Categoría</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Fecha Disponible</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Impacto</th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {donacionesFiltradas.map((donacion) => (
                    <tr key={donacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{donacion.tipo_producto}</div>
                            {/* <div className="text-xs text-gray-500">ID: {donacion.id}</div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{donacion.categoria_comida}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="font-medium">{donacion.cantidad}</span>
                        <span className="text-gray-500 ml-1">{donacion.unidad_simbolo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getEstadoIcon(donacion.estado)}
                          <span className={getEstadoBadge(donacion.estado)}>{donacion.estado}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatearFechaSolo(donacion.fecha_disponible)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {donacion.impacto_estimado_personas ? (
                          <span className="text-purple-600 font-medium">
                            ~{donacion.impacto_estimado_personas} personas
                          </span>
                        ) : (
                          <span className="text-gray-400">No calculado</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => { setDonacionDetalle(donacion); setViendoDetalle(true); }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {donacion.estado === 'Pendiente' && (
                            <>
                              <button
                                onClick={() => { setDonacionAEditar(donacion); setEditando(true); }}
                                className="text-green-600 hover:text-green-800"
                                title="Editar"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => eliminarDonacion(donacion.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
