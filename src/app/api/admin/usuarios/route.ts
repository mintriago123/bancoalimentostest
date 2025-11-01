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
