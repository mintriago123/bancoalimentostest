'use client';

import { useState } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useNotificaciones } from '@/app/hooks/useNotificaciones';
import { BellIcon, EyeIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const TIPOS_FILTRO = [
  { value: 'todos', label: 'Todos' },
  { value: 'info', label: 'Información' },
  { value: 'success', label: 'Éxito' },
  { value: 'warning', label: 'Advertencia' },
  { value: 'error', label: 'Error' }
];

const CATEGORIAS_FILTRO = [
  { value: 'todas', label: 'Todas' },
  { value: 'donacion', label: 'Donaciones' },
  { value: 'solicitud', label: 'Solicitudes' },
  { value: 'sistema', label: 'Sistema' },
  { value: 'usuario', label: 'Usuario' },
  { value: 'inventario', label: 'Inventario' }
];

export default function NotificacionesPage() {
  const router = useRouter();
  const {
    notificaciones,
    loading,
    conteoNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion
  } = useNotificaciones();

  const [filtros, setFiltros] = useState({
    tipo: 'todos',
    categoria: 'todas',
    estado: 'todas'
  });

  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);

  // Filtrar notificaciones
  const notificacionesFiltradas = notificaciones.filter(notificacion => {
    const coincideTipo = filtros.tipo === 'todos' || notificacion.tipo === filtros.tipo;
    const coincideCategoria = filtros.categoria === 'todas' || notificacion.categoria === filtros.categoria;
    const coincideEstado = filtros.estado === 'todas' || 
      (filtros.estado === 'leidas' && notificacion.leida) ||
      (filtros.estado === 'no_leidas' && !notificacion.leida);

    return coincideTipo && coincideCategoria && coincideEstado;
  });

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const obtenerColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatearFecha = (fecha: string) => {
    const fechaNotificacion = new Date(fecha);
    return fechaNotificacion.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificacionClick = async (notificacion: {
    id: string;
    leida: boolean;
    url_accion?: string;
  }) => {
    // Marcar como leída si no lo está
    if (!notificacion.leida) {
      await marcarComoLeida(notificacion.id);
    }

    // Redireccionar si tiene URL de acción
    if (notificacion.url_accion) {
      router.push(notificacion.url_accion);
    }
  };

  const handleSeleccionarNotificacion = (id: string) => {
    setSeleccionadas(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSeleccionarTodas = () => {
    setSeleccionadas(
      seleccionadas.length === notificacionesFiltradas.length 
        ? [] 
        : notificacionesFiltradas.map(n => n.id)
    );
  };

  const handleMarcarSeleccionadasComoLeidas = async () => {
    const promesas = seleccionadas
      .filter(id => {
        const notificacion = notificaciones.find(n => n.id === id);
        return notificacion && !notificacion.leida;
      })
      .map(id => marcarComoLeida(id));

    await Promise.all(promesas);
    setSeleccionadas([]);
  };

  const handleEliminarSeleccionadas = async () => {
    const promesas = seleccionadas.map(id => eliminarNotificacion(id));
    await Promise.all(promesas);
    setSeleccionadas([]);
  };

  return (
    <DashboardLayout 
      title="Notificaciones" 
      description="Gestiona todas tus notificaciones"
    >
      <div className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{notificaciones.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BellIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin leer</p>
                <p className="text-2xl font-bold text-gray-900">{conteoNoLeidas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Leídas</p>
                <p className="text-2xl font-bold text-gray-900">{notificaciones.length - conteoNoLeidas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y acciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Filtros */}
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={filtros.tipo}
                  onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIPOS_FILTRO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="categoria"
                  value={filtros.categoria}
                  onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIAS_FILTRO.map(categoria => (
                    <option key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="estado"
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todas">Todas</option>
                  <option value="no_leidas">Sin leer</option>
                  <option value="leidas">Leídas</option>
                </select>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              {conteoNoLeidas > 0 && (
                <button
                  onClick={marcarTodasComoLeidas}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Marcar todas como leídas
                </button>
              )}
              
              {seleccionadas.length > 0 && (
                <>
                  <button
                    onClick={handleMarcarSeleccionadasComoLeidas}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Marcar como leídas ({seleccionadas.length})
                  </button>
                  <button
                    onClick={handleEliminarSeleccionadas}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Eliminar ({seleccionadas.length})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
            </div>
          ) : notificacionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <BellIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay notificaciones</h3>
              <p className="text-gray-500">
                {notificaciones.length === 0 
                  ? 'No tienes notificaciones en este momento.'
                  : 'No hay notificaciones que coincidan con los filtros aplicados.'
                }
              </p>
            </div>
          ) : (
            <div>
              {/* Header de la tabla */}
              <div className="flex items-center px-6 py-3 border-b border-gray-200 bg-gray-50">
                <input
                  type="checkbox"
                  checked={seleccionadas.length === notificacionesFiltradas.length && notificacionesFiltradas.length > 0}
                  onChange={handleSeleccionarTodas}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {seleccionadas.length > 0 
                    ? `${seleccionadas.length} seleccionadas`
                    : `${notificacionesFiltradas.length} notificaciones`
                  }
                </span>
              </div>

              {/* Lista */}
              <div className="divide-y divide-gray-200">
                {notificacionesFiltradas.map((notificacion) => (
                  <div
                    key={notificacion.id}
                    className={`flex items-start px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !notificacion.leida ? 'bg-blue-25' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={seleccionadas.includes(notificacion.id)}
                      onChange={() => handleSeleccionarNotificacion(notificacion.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />

                    {/* Icono de tipo */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-4 ${
                      obtenerColorTipo(notificacion.tipo)
                    }`}>
                      {obtenerIconoTipo(notificacion.tipo)}
                    </div>

                    {/* Contenido */}
                    <div 
                      className="flex-1 ml-4 cursor-pointer"
                      onClick={() => handleNotificacionClick(notificacion)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h4 className={`text-sm font-medium ${
                            !notificacion.leida ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notificacion.titulo}
                          </h4>
                          {!notificacion.leida && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatearFecha(notificacion.fecha_creacion)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notificacion.mensaje}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                          {notificacion.categoria}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          {!notificacion.leida && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                marcarComoLeida(notificacion.id);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded"
                              title="Marcar como leída"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarNotificacion(notificacion.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                            title="Eliminar notificación"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
