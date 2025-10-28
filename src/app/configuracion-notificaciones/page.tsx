'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/app/components/DashboardLayout';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { LoadingSpinner, Alert } from '@/app/components';
import { useNotificaciones } from '@/modules/shared';
import {
  ConfiguracionCategoriaItem,
  AccionesRapidas,
  InformacionNotificaciones
} from '@/modules/shared/components/notificaciones';

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
  const { supabase, user } = useSupabase();
  const { configuracion, actualizarConfiguracion, loading } = useNotificaciones(supabase, user);
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
        <LoadingSpinner mensaje="Cargando configuración..." />
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
          <Alert
            tipo={mensaje.tipo}
            mensaje={mensaje.texto}
            onClose={() => setMensaje(null)}
          />
        )}

        {/* Acciones globales */}
        <AccionesRapidas
          onActivarTodas={handleActivarTodas}
          onDesactivarTodas={handleDesactivarTodas}
          guardando={guardando}
        />

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
              <ConfiguracionCategoriaItem
                key={config.categoria}
                config={config}
                onCambiar={handleCambiarConfiguracion}
                guardando={guardando}
              />
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <InformacionNotificaciones />
      </div>
    </DashboardLayout>
  );
}
