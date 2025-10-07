import type { SupabaseClient } from '@supabase/supabase-js';

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  categoria: string;
  url_accion?: string;
  metadatos: Record<string, unknown>;
  fecha_creacion: string;
  leida: boolean;
  destinatario_id?: string;
}

export interface ConfiguracionNotificacion {
  categoria: string;
  email_activo: boolean;
  push_activo: boolean;
  sonido_activo: boolean;
}

// Cargas
export async function fetchNotifications(supabase: SupabaseClient, userId: string, limit = 50) {
  // obtener rol del usuario
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  const { data, error } = await supabase
    .from('notificaciones')
    .select(
      `id, titulo, mensaje, tipo, categoria, url_accion, metadatos, fecha_creacion, leida, destinatario_id`
    )
    .or(`destinatario_id.eq.${userId},rol_destinatario.eq.${userData.rol},rol_destinatario.eq.TODOS`)
    .eq('activa', true)
    .order('fecha_creacion', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchConfiguracion(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('configuracion_notificaciones')
    .select('categoria, email_activo, push_activo, sonido_activo')
    .eq('usuario_id', userId);

  if (error) throw error;
  return data || [];
}

// Mutaciones
export async function markAsRead(supabase: SupabaseClient, notificacionId: string) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true, fecha_leida: new Date().toISOString() })
    .eq('id', notificacionId);

  if (error) throw error;
  return true;
}

export async function markAllAsRead(supabase: SupabaseClient, userId: string) {
  // obtener rol
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', userId)
    .single();

  if (userError) throw userError;

  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true, fecha_leida: new Date().toISOString() })
    .or(`destinatario_id.eq.${userId},rol_destinatario.eq.${userData.rol},rol_destinatario.eq.TODOS`)
    .eq('leida', false);

  if (error) throw error;
  return true;
}

export async function upsertConfiguracion(
  supabase: SupabaseClient,
  usuarioId: string,
  categoria: string,
  config: Partial<ConfiguracionNotificacion>
) {
  const payload = {
    usuario_id: usuarioId,
    categoria,
    ...config,
    fecha_actualizacion: new Date().toISOString(),
  };

  const { error } = await supabase.from('configuracion_notificaciones').upsert(payload);
  if (error) throw error;
  return true;
}

export async function createNotification(supabase: SupabaseClient, notificacion: Partial<Notificacion>) {
  const { data, error } = await supabase
    .from('notificaciones')
    .insert({
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      tipo: notificacion.tipo || 'info',
      destinatario_id: notificacion.destinatario_id,
      rol_destinatario: (notificacion as any).rol_destinatario,
      categoria: notificacion.categoria || 'sistema',
      url_accion: notificacion.url_accion,
      metadatos: notificacion.metadatos || {},
      fecha_creacion: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deactivateNotification(supabase: SupabaseClient, notificacionId: string) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ activa: false })
    .eq('id', notificacionId);

  if (error) throw error;
  return true;
}

// Realtime helper
export function createRealtimeChannel(
  supabase: SupabaseClient,
  userId: string,
  onPayload: (payload: any) => void
) {
  const channel = supabase
    .channel('notificaciones_realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notificaciones',
        filter: `destinatario_id=eq.${userId}`,
      },
      (payload) => {
        onPayload(payload);
      }
    )
    .subscribe();

  return channel;
}
