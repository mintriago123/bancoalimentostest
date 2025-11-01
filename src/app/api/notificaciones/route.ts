import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { NotificationService } from '@/modules/shared/services/notificationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.titulo || !body?.mensaje) {
      return NextResponse.json(
        { error: 'Los campos titulo y mensaje son obligatorios.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: usuario, error: usuarioError } = await adminSupabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (usuarioError || !usuario) {
      return NextResponse.json({ error: 'No se pudo validar el rol del usuario.' }, { status: 403 });
    }

    const rol = usuario.rol?.toUpperCase();
    const rolesPermitidos = ['ADMINISTRADOR', 'OPERADOR', 'DONANTE', 'SOLICITANTE'];

    if (!rol || !rolesPermitidos.includes(rol)) {
      return NextResponse.json({ error: 'No tienes permisos para crear notificaciones.' }, { status: 403 });
    }


    const service = new NotificationService(adminSupabase);

    const notificacion = await service.createNotification({
      titulo: body.titulo,
      mensaje: body.mensaje,
      tipo: body.tipo,
      categoria: body.categoria,
      urlAccion: body.urlAccion ?? body.url_accion,
      destinatarioId: body.destinatarioId ?? body.destinatario_id,
      rolDestinatario: body.rolDestinatario ?? body.rol_destinatario,
      metadatos: body.metadatos,
      expiraEn: body.expiraEn ?? body.expira_en,
      enviarEmail: body.enviarEmail,
      email: body.email,
    });

    return NextResponse.json({ notificacion });
  } catch (error) {
    console.error('Error en POST /api/notificaciones:', error);
    return NextResponse.json(
      { error: 'Error al crear la notificacion.' },
      { status: 500 }
    );
  }
}
