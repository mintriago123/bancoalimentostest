import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

type CreateUserRequest = {
  email: string;
  password: string;
  rol: 'ADMINISTRADOR' | 'OPERADOR' | 'DONANTE' | 'SOLICITANTE';
  nombre?: string;
  tipo_persona?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateUserRequest;
    if (!body.email || !body.password || !body.rol) {
      return NextResponse.json(
        { error: 'email, password y rol son obligatorios.' },
        { status: 400 }
      );
    }

    const admin = createAdminSupabaseClient();

    // Crear usuario en auth con la clave de servicio
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError || !authData?.user) {
      console.error('Error creando usuario en auth:', authError);
      return NextResponse.json(
        { error: 'No se pudo crear el usuario de autenticación.' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    const payload = {
      id: userId,
      rol: body.rol,
      tipo_persona: body.tipo_persona ?? 'natural',
      nombre: body.nombre ?? '',
      email: body.email,
      estado: 'activo' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const insertRes: PostgrestSingleResponse<unknown> = await admin
      .from('usuarios')
      .insert(payload)
      .select()
      .single();

    if (insertRes.error) {
      console.error('Error insertando en usuarios:', insertRes.error);
      return NextResponse.json(
        { error: 'Usuario creado en auth, pero falló al registrar en la tabla usuarios.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: userId,
      email: body.email,
      rol: body.rol,
    });
  } catch (error) {
    console.error('Error en POST /api/admin/usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno al crear el usuario.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { error: 'userId y updates son obligatorios.' },
        { status: 400 }
      );
    }

    // Verificar que la service role key esté configurada
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY no está configurada en las variables de entorno');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta. SUPABASE_SERVICE_ROLE_KEY no encontrada.' },
        { status: 500 }
      );
    }

    // Usar cliente admin para bypass RLS
    const admin = createAdminSupabaseClient();

    // Actualizar usuario con bypass de RLS
    const { error } = await admin
      .from('usuarios')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error actualizando usuario:', error);
      return NextResponse.json(
        { error: 'No fue posible actualizar el usuario', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en PATCH /api/admin/usuarios:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error interno al actualizar el usuario.', details: errorMessage },
      { status: 500 }
    );
  }
}
