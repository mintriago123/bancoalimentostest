import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { sendEmail, EmailOptions } from '@/lib/email';
import { buildNotificationEmailTemplate } from '@/lib/email/templates/notificationEmail';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface CreateNotificationInput {
  titulo: string;
  mensaje: string;
  tipo?: NotificationType;
  categoria?: string;
  urlAccion?: string;
  destinatarioId?: string;
  rolDestinatario?: string;
  metadatos?: Record<string, unknown>;
  expiraEn?: string;
  enviarEmail?: boolean;
  email?: Pick<
    EmailOptions,
    'to' | 'subject' | 'html' | 'text' | 'from' | 'cc' | 'bcc' | 'replyTo' | 'attachments' | 'headers'
  >;
}

export interface NotificacionRecord {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  categoria: string;
  destinatario_id: string | null;
  rol_destinatario: string | null;
  url_accion: string | null;
  metadatos: Record<string, unknown> | null;
  fecha_creacion: string;
  leida: boolean;
  activa: boolean;
  expira_en: string | null;
}

interface UsuarioRecord {
  id: string;
  email: string | null;
  nombre: string | null;
  estado: string | null;
  rol: string | null;
  recibir_notificaciones?: boolean | null;
}

interface ResolvedRecipient {
  id?: string;
  email: string;
  nombre?: string | null;
}

const DEFAULT_CATEGORY = 'sistema';

export class NotificationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createNotification(input: CreateNotificationInput): Promise<NotificacionRecord> {
    const categoria = input.categoria ?? DEFAULT_CATEGORY;

    const { data, error } = await this.supabase
      .from('notificaciones')
      .insert({
        titulo: input.titulo,
        mensaje: input.mensaje,
        tipo: input.tipo ?? 'info',
        categoria,
        destinatario_id: input.destinatarioId ?? null,
        rol_destinatario: input.rolDestinatario ?? null,
        url_accion: input.urlAccion ?? null,
        metadatos: input.metadatos ?? {},
        expira_en: input.expiraEn ?? null,
        fecha_creacion: new Date().toISOString(),
        activa: true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`No se pudo crear la notificacion: ${error?.message ?? 'error desconocido'}`);
    }

    const notificacion = data as NotificacionRecord;

    if (input.enviarEmail !== false) {
      await this.dispararCorreo(notificacion, input);
    }

    return notificacion;
  }

  private async dispararCorreo(notificacion: NotificacionRecord, input: CreateNotificationInput) {
    try {
      const categoria = notificacion.categoria ?? DEFAULT_CATEGORY;
      const destinatarios = await this.resolverDestinatarios(notificacion, input, categoria);

      if (destinatarios.length === 0) {
        return;
      }

      const envios = destinatarios.map((destinatario) => {
        const plantilla = buildNotificationEmailTemplate({
          titulo: notificacion.titulo,
          mensaje: notificacion.mensaje,
          categoria,
          urlAccion: notificacion.url_accion,
          destinatarioNombre: destinatario.nombre ?? null,
        });

        const emailOptions: EmailOptions = {
          to: destinatario.email,
          subject: input.email?.subject ?? plantilla.subject,
          html: input.email?.html ?? plantilla.html,
          text: input.email?.text ?? plantilla.text,
          from: input.email?.from,
          cc: input.email?.cc,
          bcc: input.email?.bcc,
          replyTo: input.email?.replyTo,
          attachments: input.email?.attachments,
          headers: input.email?.headers,
        };

        return sendEmail(emailOptions);
      });

      const resultados = await Promise.allSettled(envios);

      resultados.forEach((resultado, index) => {
        if (resultado.status === 'rejected') {
          console.error(
            `Error enviando correo de notificacion a ${destinatarios[index]?.email}:`,
            resultado.reason
          );
        }
      });
    } catch (error) {
      console.error('Error general enviando correos de notificacion:', error);
    }
  }

  private async resolverDestinatarios(
    notificacion: NotificacionRecord,
    input: CreateNotificationInput,
    categoria: string
  ): Promise<ResolvedRecipient[]> {
    if (input.email?.to) {
      const to = Array.isArray(input.email.to) ? input.email.to : [input.email.to];
      return to.filter(Boolean).map((email) => ({ email }));
    }

    if (input.destinatarioId) {
      const usuario = await this.obtenerUsuarioPorId(input.destinatarioId);
      if (
        !usuario ||
        !usuario.email ||
        (usuario.estado && usuario.estado.toLowerCase() !== 'activo') ||
        usuario.recibir_notificaciones === false
      ) {
        return [];
      }

      const habilitado = await this.estaEmailHabilitado(usuario.id, categoria);
      if (!habilitado) {
        return [];
      }

      return [
        {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
        },
      ];
    }

    if (input.rolDestinatario) {
      const usuarios = await this.obtenerUsuariosPorRol(input.rolDestinatario);
      if (usuarios.length === 0) {
        return [];
      }

      const usuariosFiltrados = await this.filtrarPorPreferencias(usuarios, categoria);
      return usuariosFiltrados;
    }

    console.warn(
      `Notificacion ${notificacion.id} creada sin destinatarioId ni rolDestinatario. No se enviara correo.`
    );
    return [];
  }

  private async obtenerUsuarioPorId(usuarioId: string): Promise<UsuarioRecord | null> {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, email, nombre, estado, rol, recibir_notificaciones')
      .eq('id', usuarioId)
      .single();

    if (error) {
      if ((error as any)?.code === 'PGRST204') {
        console.warn('columna recibir_notificaciones no disponible en usuarios, usando valor por defecto.');
        const fallback = await this.supabase
          .from('usuarios')
          .select('id, email, nombre, estado, rol')
          .eq('id', usuarioId)
          .single();

        return fallback.data as UsuarioRecord | null;
      }

      console.error(`Error al obtener usuario ${usuarioId}:`, error);
      return null;
    }

    return data as UsuarioRecord | null;
  }

  private async obtenerUsuariosPorRol(rol: string): Promise<UsuarioRecord[]> {
    const normalizedRol = rol.toUpperCase();
    let query = this.supabase
      .from('usuarios')
      .select('id, email, nombre, estado, rol, recibir_notificaciones');

    if (normalizedRol !== 'TODOS') {
      query = query.eq('rol', normalizedRol);
    }

    const { data, error } = await query;

    if (error) {
      if ((error as any)?.code === 'PGRST204') {
        console.warn('columna recibir_notificaciones no disponible en usuarios, usando valor por defecto.');
        let fallbackQuery = this.supabase
          .from('usuarios')
          .select('id, email, nombre, estado, rol');

        if (normalizedRol !== 'TODOS') {
          fallbackQuery = fallbackQuery.eq('rol', normalizedRol);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;

        if (fallbackError) {
          console.error(`Error al obtener usuarios por rol ${rol}:`, fallbackError);
          return [];
        }

        return (fallbackData ?? []).filter(Boolean) as UsuarioRecord[];
      }

      console.error(`Error al obtener usuarios por rol ${rol}:`, error);
      return [];
    }

    return (data ?? []).filter(Boolean) as UsuarioRecord[];
  }

  private async filtrarPorPreferencias(
    usuarios: UsuarioRecord[],
    categoria: string
  ): Promise<ResolvedRecipient[]> {
    const activosConCorreo = usuarios.filter((usuario) => {
      if (!usuario.email) return false;
      if (usuario.estado && usuario.estado.toLowerCase() !== 'activo') return false;
      if (usuario.recibir_notificaciones === false) return false;
      return true;
    });

    const ids = activosConCorreo.map((usuario) => usuario.id);

    const preferencias = await this.obtenerPreferencias(ids, categoria);

    return activosConCorreo
      .filter((usuario) => preferencias.get(usuario.id) !== false)
      .map((usuario) => ({
        id: usuario.id,
        email: usuario.email as string,
        nombre: usuario.nombre,
      }));
  }

  private async estaEmailHabilitado(usuarioId: string, categoria: string): Promise<boolean> {
    const preferencias = await this.obtenerPreferencias([usuarioId], categoria);
    const preferencia = preferencias.get(usuarioId);
    return preferencia !== false;
  }

  private async obtenerPreferencias(
    usuarioIds: string[],
    categoria: string
  ): Promise<Map<string, boolean>> {
    const mapa = new Map<string, boolean>();

    if (usuarioIds.length === 0) {
      return mapa;
    }

    const { data, error } = await this.supabase
      .from('configuracion_notificaciones')
      .select('usuario_id, email_activo')
      .in('usuario_id', usuarioIds)
      .eq('categoria', categoria);

    if (error) {
      console.error('Error al obtener preferencias de notificaciones:', error);
      return mapa;
    }

    data?.forEach((row: { usuario_id: string; email_activo: boolean }) => {
      mapa.set(row.usuario_id, row.email_activo);
    });

    return mapa;
  }
}
