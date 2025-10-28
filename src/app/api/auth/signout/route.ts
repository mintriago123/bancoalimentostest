import { createServerSupabaseClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Cerrar sesión en Supabase (esto limpiará las cookies)
    await supabase.auth.signOut();
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
