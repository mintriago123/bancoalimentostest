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
      error
    } = await supabase.auth.getUser();

    // Si hay error al obtener el usuario, asumir que no está autenticado
    const isAuthenticated = user && !error;

    const { pathname } = request.nextUrl;

    // Si el usuario ya está logueado y trata de acceder a iniciar sesión o registrarse, redirigir al dashboard
    if ((pathname === '/auth/iniciar-sesion' || pathname === '/auth/registrar') && isAuthenticated) {
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('estado, rol')
        .eq('id', user.id)
        .single();

      if (perfil) {
        const estadoUsuario = perfil.estado || 'activo';
        
        // Si el usuario está bloqueado o desactivado, cerrar sesión y permitir acceso a auth
        if (estadoUsuario === 'bloqueado' || estadoUsuario === 'desactivado') {
          await supabase.auth.signOut();
          return supabaseResponse;
        }

        // Redirigir al dashboard según el rol
        if (perfil.rol === 'ADMINISTRADOR') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else if (perfil.rol === 'DONANTE') {
          return NextResponse.redirect(new URL('/donante/dashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
      }
    }

    // Verificar si la ruta actual es pública
    const esRutaPublica = RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta));

    // Si es una ruta pública, permitir acceso
    if (esRutaPublica) {
      return supabaseResponse;
    }

    // Para rutas protegidas, verificar autenticación
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/donante') || pathname.startsWith('/user')) {
      if (!isAuthenticated) {
        const url = new URL('/auth/iniciar-sesion', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Si está autenticado, verificar el estado del usuario
      const { data: perfil } = await supabase
        .from('usuarios')
        .select('estado, rol')
        .eq('id', user.id)
        .single();

      if (perfil) {
        const estadoUsuario = perfil.estado || 'activo';
        
        // Si el usuario está bloqueado o desactivado, cerrar sesión y redirigir
        if (estadoUsuario === 'bloqueado' || estadoUsuario === 'desactivado') {
          await supabase.auth.signOut();
          const url = new URL('/auth/iniciar-sesion', request.url);
          url.searchParams.set('error', estadoUsuario === 'bloqueado' ? 'blocked' : 'deactivated');
          return NextResponse.redirect(url);
        }
      }
    }

    // Permitir acceso a la página principal de bienvenida
    // Los usuarios logueados pueden acceder tanto a la página principal como a sus dashboards
    if (pathname === '/') {
      // Si está autenticado, verificar el estado del usuario pero permitir acceso a la página de bienvenida
      if (isAuthenticated) {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('estado, rol')
          .eq('id', user.id)
          .single();

        if (perfil) {
          const estadoUsuario = perfil.estado || 'activo';
          
          // Si el usuario está bloqueado o desactivado, cerrar sesión y redirigir
          if (estadoUsuario === 'bloqueado' || estadoUsuario === 'desactivado') {
            await supabase.auth.signOut();
            const url = new URL('/auth/iniciar-sesion', request.url);
            url.searchParams.set('error', estadoUsuario === 'bloqueado' ? 'blocked' : 'deactivated');
            return NextResponse.redirect(url);
          }
        }
      }
      
      // Permitir acceso a la página de bienvenida sin redirecciones automáticas
      return supabaseResponse;
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