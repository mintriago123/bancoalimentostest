'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useNotificaciones } from '@/app/hooks/useNotificaciones';
import { BellIcon, EnvelopeIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

// Componente Switch personalizado
interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
}

function Switch({ checked, onChange, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  );
}

interface ConfiguracionCategoria {
  categoria: string;
  nombre: string;
  descripcion: string;
  email_activo: boolean;
  push_activo: boolean;
  sonido_activo: boolean;
}

const CATEGORIAS_CONFIG: Omit<ConfiguracionCategoria, 'email_activo' | 'push_activo' | 'sonido_activo'>[] = [
  {
    categoria: 'donacion',
    nombre: 'Donaciones',
    descripcion: 'Notificaciones sobre el estado de las donaciones y nuevas donaciones recibidas'
  },
  {
    categoria: 'solicitud',
    nombre: 'Solicitudes',
    descripcion: 'Notificaciones sobre solicitudes de alimentos y cambios de estado'
  },
  {
    categoria: 'inventario',
    nombre: 'Inventario',
    descripcion: 'Alertas sobre stock bajo, productos próximos a vencer y movimientos de inventario'
  },
  {
    categoria: 'usuario',
    nombre: 'Usuario',
    descripcion: 'Notificaciones sobre cambios en tu cuenta, estado y configuración'
  },
  {
    categoria: 'sistema',
    nombre: 'Sistema',
    descripcion: 'Notificaciones generales del sistema, mantenimiento y actualizaciones'
  }
];

export default function ConfiguracionNotificacionesPage() {
  const { configuracion, actualizarConfiguracion, loading } = useNotificaciones();
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionCategoria[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

  useEffect(() => {
    // Inicializar configuraciones con valores por defecto
    const configsIniciales = CATEGORIAS_CONFIG.map(cat => {
      const configExistente = configuracion.find(c => c.categoria === cat.categoria);
      return {
        ...cat,
        email_activo: configExistente?.email_activo ?? true,
        push_activo: configExistente?.push_activo ?? true,
        sonido_activo: configExistente?.sonido_activo ?? true
      };
    });
    setConfiguraciones(configsIniciales);
  }, [configuracion]);

  const handleCambiarConfiguracion = async (
    categoria: string, 
    tipo: 'email_activo' | 'push_activo' | 'sonido_activo', 
    valor: boolean
  ) => {
    try {
      setGuardando(true);
      
      // Actualizar en la base de datos
      const exito = await actualizarConfiguracion(categoria, { [tipo]: valor });
      
      if (exito) {
        // Actualizar estado local
        setConfiguraciones(prev => 
          prev.map(config => 
            config.categoria === categoria 
              ? { ...config, [tipo]: valor }
              : config
          )
        );
        
        setMensaje({ tipo: 'success', texto: 'Configuración actualizada correctamente' });
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al actualizar la configuración' });
      }
    } catch (error) {
      console.error('Error al cambiar configuración:', error);
      setMensaje({ tipo: 'error', texto: 'Error al actualizar la configuración' });
    } finally {
      setGuardando(false);
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleDesactivarTodas = async () => {
    try {
      setGuardando(true);
      
      const promesas = CATEGORIAS_CONFIG.map(cat => 
        actualizarConfiguracion(cat.categoria, {
          email_activo: false,
          push_activo: false,
          sonido_activo: false
        })
      );
      
      await Promise.all(promesas);
      
      setConfiguraciones(prev => 
        prev.map(config => ({
          ...config,
          email_activo: false,
          push_activo: false,
          sonido_activo: false
        }))
      );
      
      setMensaje({ tipo: 'success', texto: 'Todas las notificaciones han sido desactivadas' });
    } catch (error) {
      console.error('Error al desactivar todas:', error);
      setMensaje({ tipo: 'error', texto: 'Error al desactivar las notificaciones' });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const handleActivarTodas = async () => {
    try {
      setGuardando(true);
      
      const promesas = CATEGORIAS_CONFIG.map(cat => 
        actualizarConfiguracion(cat.categoria, {
          email_activo: true,
          push_activo: true,
          sonido_activo: true
        })
      );
      
      await Promise.all(promesas);
      
      setConfiguraciones(prev => 
        prev.map(config => ({
          ...config,
          email_activo: true,
          push_activo: true,
          sonido_activo: true
        }))
      );
      
      setMensaje({ tipo: 'success', texto: 'Todas las notificaciones han sido activadas' });
    } catch (error) {
      console.error('Error al activar todas:', error);
      setMensaje({ tipo: 'error', texto: 'Error al activar las notificaciones' });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Configuración de Notificaciones">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando configuración...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Configuración de Notificaciones" 
      description="Personaliza cómo y cuándo recibir notificaciones"
    >
      <div className="space-y-6">
        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`p-4 rounded-md ${
            mensaje.tipo === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {mensaje.texto}
          </div>
        )}

        {/* Acciones globales */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="flex gap-4">
            <button
              onClick={handleActivarTodas}
              disabled={guardando}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {guardando ? 'Guardando...' : 'Activar Todas'}
            </button>
            <button
              onClick={handleDesactivarTodas}
              disabled={guardando}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {guardando ? 'Guardando...' : 'Desactivar Todas'}
            </button>
          </div>
        </div>

        {/* Configuración por categoría */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Configuración por Categoría</h2>
            <p className="text-sm text-gray-600 mt-1">
              Personaliza las notificaciones según el tipo de contenido
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {configuraciones.map((config) => (
              <div key={config.categoria} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {config.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {config.descripcion}
                    </p>
                  </div>

                  <div className="ml-6 grid grid-cols-3 gap-6">
                    {/* Email */}
                    <div className="flex flex-col items-center space-y-2">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">Email</span>
                      <Switch
                        checked={config.email_activo}
                        onChange={(checked: boolean) => 
                          handleCambiarConfiguracion(config.categoria, 'email_activo', checked)
                        }
                        disabled={guardando}
                      />
                    </div>

                    {/* Push */}
                    <div className="flex flex-col items-center space-y-2">
                      <BellIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">Push</span>
                      <Switch
                        checked={config.push_activo}
                        onChange={(checked: boolean) => 
                          handleCambiarConfiguracion(config.categoria, 'push_activo', checked)
                        }
                        disabled={guardando}
                      />
                    </div>

                    {/* Sonido */}
                    <div className="flex flex-col items-center space-y-2">
                      <SpeakerWaveIcon className="h-5 w-5 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">Sonido</span>
                      <Switch
                        checked={config.sonido_activo}
                        onChange={(checked: boolean) => 
                          handleCambiarConfiguracion(config.categoria, 'sonido_activo', checked)
                        }
                        disabled={guardando}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-base font-medium text-blue-900 mb-2">
            ℹ️ Información sobre las Notificaciones
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Email:</strong> Recibirás notificaciones en tu correo electrónico</li>
            <li>• <strong>Push:</strong> Notificaciones en tiempo real mientras usas la aplicación</li>
            <li>• <strong>Sonido:</strong> Reproducir sonido al recibir notificaciones push</li>
            <li>• Los cambios se guardan automáticamente</li>
            <li>• Puedes cambiar estas configuraciones en cualquier momento</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
