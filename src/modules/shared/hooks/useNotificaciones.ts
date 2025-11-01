'use client';

import { useState, useEffect, useCallback } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';

interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  categoria: string;
  url_accion?: string;
  metadatos: Record<string, unknown>;
  fecha_creacion: string;
  leida: boolean;
}

interface ConfiguracionNotificacion {
  categoria: string;
  email_activo: boolean;
  push_activo: boolean;
  sonido_activo: boolean;
}

export function useNotificaciones(supabase: SupabaseClient, user: User | null) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionNotificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);

  // Cargar notificaciones del usuario
  const cargarNotificaciones = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Obtener rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Obtener notificaciones
      const { data: notificacionesData, error: notificacionesError } = await supabase
        .from('notificaciones')
        .select(`
          id,
          titulo,
          mensaje,
          tipo,
          categoria,
          url_accion,
          metadatos,
          fecha_creacion,
          leida
        `)
        .or(`destinatario_id.eq.${user.id},rol_destinatario.eq.${userData.rol},rol_destinatario.eq.TODOS`)
        .eq('activa', true)
        .order('fecha_creacion', { ascending: false })
        .limit(50);

      if (notificacionesError) throw notificacionesError;

      setNotificaciones(notificacionesData || []);
      
      // Contar no leídas
      const noLeidas = (notificacionesData || []).filter(n => !n.leida).length;
      setConteoNoLeidas(noLeidas);

    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Cargar configuración de notificaciones
  const cargarConfiguracion = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('configuracion_notificaciones')
        .select('categoria, email_activo, push_activo, sonido_activo')
        .eq('usuario_id', user.id);

      if (error) throw error;
      setConfiguracion(data || []);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    }
  }, [supabase, user]);

  // Marcar notificación como leída
  const marcarComoLeida = async (notificacionId: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ 
          leida: true, 
          fecha_leida: new Date().toISOString() 
        })
        .eq('id', notificacionId);

      if (error) throw error;

      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => 
          n.id === notificacionId ? { ...n, leida: true } : n
        )
      );

      // Actualizar conteo
      setConteoNoLeidas(prev => Math.max(0, prev - 1));

      return true;
    } catch (err) {
      console.error('Error al marcar como leída:', err);
      return false;
    }
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    if (!user) return false;

    try {
      // Obtener rol del usuario
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const { error } = await supabase
        .from('notificaciones')
        .update({ 
          leida: true, 
          fecha_leida: new Date().toISOString() 
        })
        .or(`destinatario_id.eq.${user.id},rol_destinatario.eq.${userData.rol},rol_destinatario.eq.TODOS`)
        .eq('leida', false);

      if (error) throw error;

      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
      setConteoNoLeidas(0);

      return true;
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      return false;
    }
  };

  // Actualizar configuración
  const actualizarConfiguracion = async (categoria: string, config: Partial<ConfiguracionNotificacion>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('configuracion_notificaciones')
        .upsert({
          usuario_id: user.id,
          categoria,
          ...config,
          fecha_actualizacion: new Date().toISOString()
        });

      if (error) throw error;

      // Actualizar estado local
      setConfiguracion(prev => {
        const existe = prev.find(c => c.categoria === categoria);
        if (existe) {
          return prev.map(c => 
            c.categoria === categoria ? { ...c, ...config } : c
          );
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

  // Crear notificación (solo para admin)
  const crearNotificacion = async (notificacion: {
    titulo: string;
    mensaje: string;
    tipo?: 'info' | 'success' | 'warning' | 'error';
    destinatario_id?: string;
    destinatarioId?: string;
    rol_destinatario?: string;
    rolDestinatario?: string;
    categoria?: string;
    url_accion?: string;
    urlAccion?: string;
    metadatos?: Record<string, unknown>;
    expira_en?: string;
    expiraEn?: string;
    enviarEmail?: boolean;
    email?: {
      to?: string | string[];
      subject?: string;
      html?: string;
      text?: string;
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
      replyTo?: string;
      attachments?: Array<{
        filename: string;
        path?: string;
        content?: string;
        contentType?: string;
      }>;
      headers?: Record<string, string>;
    };
  }) => {
    try {
      const payload = {
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        tipo: notificacion.tipo,
        categoria: notificacion.categoria,
        urlAccion: notificacion.urlAccion ?? notificacion.url_accion,
        destinatarioId: notificacion.destinatarioId ?? notificacion.destinatario_id,
        rolDestinatario: notificacion.rolDestinatario ?? notificacion.rol_destinatario,
        metadatos: notificacion.metadatos,
        expiraEn: notificacion.expiraEn ?? notificacion.expira_en,
        enviarEmail: notificacion.enviarEmail,
        email: notificacion.email,
      };

      const response = await fetch('/api/notificaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const message = errorBody?.error ?? 'No se pudo crear la notificación';
        throw new Error(message);
      }

      const data = await response.json();
      return data?.notificacion ?? null;
    } catch (err) {
      console.error('Error al crear notificación:', err);
      throw err;
    }
  };

  // Eliminar notificación
  const eliminarNotificacion = async (notificacionId: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ activa: false })
        .eq('id', notificacionId);

      if (error) throw error;

      // Actualizar estado local
      setNotificaciones(prev => prev.filter(n => n.id !== notificacionId));
      
      // Actualizar conteo si no estaba leída
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

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notificaciones_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notificaciones',
          filter: `destinatario_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const nuevaNotificacion = payload.new as Notificacion;
            setNotificaciones(prev => [nuevaNotificacion, ...prev]);
            if (!nuevaNotificacion.leida) {
              setConteoNoLeidas(prev => prev + 1);
            }
          } else if (payload.eventType === 'UPDATE') {
            const notificacionActualizada = payload.new as Notificacion;
            setNotificaciones(prev => 
              prev.map(n => 
                n.id === notificacionActualizada.id ? notificacionActualizada : n
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  // Cargar datos iniciales
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
    recargar: cargarNotificaciones
  };
}
