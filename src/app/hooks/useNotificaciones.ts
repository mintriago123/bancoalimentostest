
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import * as notificationsService from '@/services/notificationsService';

export function useNotificaciones() {
  const { supabase, user } = useSupabase();
  const [notificaciones, setNotificaciones] = useState<notificationsService.Notificacion[]>([]);
  const [configuracion, setConfiguracion] = useState<notificationsService.ConfiguracionNotificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);

  const cargarNotificaciones = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsService.fetchNotifications(supabase, user.id);
      setNotificaciones(data);
      const noLeidas = (data || []).filter(n => !n.leida).length;
      setConteoNoLeidas(noLeidas);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  const cargarConfiguracion = useCallback(async () => {
    if (!user) return;
    try {
      const data = await notificationsService.fetchConfiguracion(supabase, user.id);
      setConfiguracion(data);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    }
  }, [supabase, user]);

  const marcarComoLeida = async (notificacionId: string) => {
    try {
      await notificationsService.markAsRead(supabase, notificacionId);
      setNotificaciones(prev => prev.map(n => (n.id === notificacionId ? { ...n, leida: true } : n)));
      setConteoNoLeidas(prev => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Error al marcar como leída:', err);
      return false;
    }
  };

  const marcarTodasComoLeidas = async () => {
    if (!user) return false;
    try {
      await notificationsService.markAllAsRead(supabase, user.id);
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setConteoNoLeidas(0);
      return true;
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      return false;
    }
  };

  const actualizarConfiguracion = async (categoria: string, config: Partial<notificationsService.ConfiguracionNotificacion>) => {
    if (!user) return false;
    try {
      await notificationsService.upsertConfiguracion(supabase, user.id, categoria, config);
      setConfiguracion(prev => {
        const existe = prev.find(c => c.categoria === categoria);
        if (existe) {
          return prev.map(c => (c.categoria === categoria ? { ...c, ...config } : c));
        } else {
          return [...prev, { categoria, email_activo: true, push_activo: true, sonido_activo: true, ...config }];
        }
      });
      return true;
    } catch (err) {
      console.error('Error al actualizar configuración:', err);
      return false;
    }
  };

  const crearNotificacion = async (notificacion: Partial<notificationsService.Notificacion>) => {
    try {
      const created = await notificationsService.createNotification(supabase, notificacion);
      return created;
    } catch (err) {
      console.error('Error al crear notificación:', err);
      throw err;
    }
  };

  const eliminarNotificacion = async (notificacionId: string) => {
    try {
      await notificationsService.deactivateNotification(supabase, notificacionId);
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      const notificacion = notificaciones.find(n => n.id === notificacionId);
      if (notificacion && !notificacion.leida) {
        setConteoNoLeidas(prev => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      return false;
    }
  };

  // Suscripción realtime delegada al servicio
  useEffect(() => {
    if (!user) return;

    const channel = notificationsService.createRealtimeChannel(supabase, user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        const nuevaNotificacion = payload.new as notificationsService.Notificacion;
        setNotificaciones(prev => [nuevaNotificacion, ...prev]);
        if (!nuevaNotificacion.leida) setConteoNoLeidas(prev => prev + 1);
      } else if (payload.eventType === 'UPDATE') {
        const notificacionActualizada = payload.new as notificationsService.Notificacion;
        setNotificaciones(prev => prev.map(n => (n.id === notificacionActualizada.id ? notificacionActualizada : n)));
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  useEffect(() => {
    if (user) {
      cargarNotificaciones();
      cargarConfiguracion();
    }
  }, [user, cargarNotificaciones, cargarConfiguracion]);

  return {
    notificaciones,
    configuracion,
    loading,
    error,
    conteoNoLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    actualizarConfiguracion,
    crearNotificacion,
    eliminarNotificacion,
    recargar: cargarNotificaciones,
  };
}
