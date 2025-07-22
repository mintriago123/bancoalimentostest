import { createServerSupabaseClient } from '@/lib/supabase-server';
import { RUTAS_PUBLICAS } from '@/lib/constantes';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Verificar si la ruta actual es pública
    const esRutaPublica = RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta));

    // Si es una ruta pública, permitir acceso
    if (esRutaPublica) {
      return supabaseResponse;
    }

    // Para rutas protegidas, verificar autenticación
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/donante') || pathname.startsWith('/user')) {
      if (!user) {
        const url = new URL('/auth/iniciar-sesion', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }
    }

    // Para la página principal, redirigir según el rol del usuario
    if (pathname === '/') {
      if (user) {
        // Consultar el rol del usuario para redirigir correctamente
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id', user.id)
          .single();

        if (perfil?.rol === 'ADMINISTRADOR') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else if (perfil?.rol === 'DONANTE') {
          return NextResponse.redirect(new URL('/donante/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }

    return supabaseResponse;
  } catch {
    // Si hay error, permitir el acceso y manejar la autenticación en el cliente
    return supabaseResponse;
  }
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto las que comienzan con:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imagen)
     * - favicon.ico (archivo favicon)
     * Siéntete libre de modificar este patrón para incluir más rutas.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 