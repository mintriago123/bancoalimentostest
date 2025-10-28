import { createServerSupabaseClient } from '@/lib/supabase-server';
import { RUTAS_PUBLICAS } from '@/lib/constantes';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = await createServerSupabaseClient();

    // Obtener usuario y suprimir errores esperados de refresh token
    let user = null;
    let error = null;
    
    try {
      const result = await supabase.auth.getUser();
      user = result.data.user;
      error = result.error;
    } catch (err: any) {
      // Suprimir logs de errores esperados (refresh token no encontrado)
      if (err?.code !== 'refresh_token_not_found') {
        console.error('Error de autenticación en middleware:', err);
      }
      error = err;
    }

    // Si hay error al obtener el usuario, asumir que no está autenticado
    const isAuthenticated = !!(user && !error);

    const { pathname } = request.nextUrl;

    // Si el usuario ya está logueado y trata de acceder a iniciar sesión o registrarse, redirigir al dashboard
    if ((pathname === '/auth/iniciar-sesion' || pathname === '/auth/registrar') && isAuthenticated && user) {
      try {
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
          } else if (perfil.rol === 'OPERADOR') {
            return NextResponse.redirect(new URL('/operador/dashboard', request.url));
          } else if (perfil.rol === 'DONANTE') {
            return NextResponse.redirect(new URL('/donante/dashboard', request.url));
          } else {
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
          }
        }
      } catch (error) {
        // Si hay error obteniendo el perfil, permitir acceso a auth
        console.error('Error obteniendo perfil en middleware:', error);
        return supabaseResponse;
      }
    }

    // Verificar si la ruta actual es pública
    const esRutaPublica = RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta));

    // Si es una ruta pública, permitir acceso
    if (esRutaPublica) {
      return supabaseResponse;
    }

    // Para rutas protegidas, verificar autenticación y autorización
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/operador') || pathname.startsWith('/donante') || pathname.startsWith('/user')) {
      if (!isAuthenticated || !user) {
        const url = new URL('/auth/iniciar-sesion', request.url);
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
      }

      // Si está autenticado, verificar el estado del usuario y autorización
      try {
        const { data: perfil } = await supabase
          .from('usuarios')
          .select('estado, rol')
          .eq('id', user.id)
          .single();

        if (perfil) {
          const estadoUsuario = perfil.estado || 'activo';
          const rolUsuario = perfil.rol;
          
          // Si el usuario está bloqueado o desactivado, cerrar sesión y redirigir
          if (estadoUsuario === 'bloqueado' || estadoUsuario === 'desactivado') {
            await supabase.auth.signOut();
            const url = new URL('/auth/iniciar-sesion', request.url);
            url.searchParams.set('error', estadoUsuario === 'bloqueado' ? 'blocked' : 'deactivated');
            return NextResponse.redirect(url);
          }

          // Verificar autorización por rol
          if (pathname.startsWith('/admin') && rolUsuario !== 'ADMINISTRADOR') {
            // Redirigir al dashboard correspondiente según el rol
            if (rolUsuario === 'OPERADOR') {
              return NextResponse.redirect(new URL('/operador/dashboard', request.url));
            } else if (rolUsuario === 'DONANTE') {
              return NextResponse.redirect(new URL('/donante/dashboard', request.url));
            } else {
              return NextResponse.redirect(new URL('/user/dashboard', request.url));
            }
          }

          if (pathname.startsWith('/operador') && rolUsuario !== 'OPERADOR') {
            // Redirigir al dashboard correspondiente según el rol
            if (rolUsuario === 'ADMINISTRADOR') {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            } else if (rolUsuario === 'DONANTE') {
              return NextResponse.redirect(new URL('/donante/dashboard', request.url));
            } else {
              return NextResponse.redirect(new URL('/user/dashboard', request.url));
            }
          }

          if (pathname.startsWith('/donante') && rolUsuario !== 'DONANTE') {
            // Redirigir al dashboard correspondiente según el rol
            if (rolUsuario === 'ADMINISTRADOR') {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            } else if (rolUsuario === 'OPERADOR') {
              return NextResponse.redirect(new URL('/operador/dashboard', request.url));
            } else {
              return NextResponse.redirect(new URL('/user/dashboard', request.url));
            }
          }

          if (pathname.startsWith('/user') && rolUsuario !== 'SOLICITANTE') {
            // Redirigir al dashboard correspondiente según el rol
            if (rolUsuario === 'ADMINISTRADOR') {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            } else if (rolUsuario === 'OPERADOR') {
              return NextResponse.redirect(new URL('/operador/dashboard', request.url));
            } else if (rolUsuario === 'DONANTE') {
              return NextResponse.redirect(new URL('/donante/dashboard', request.url));
            }
          }

          // Verificar acceso a /dashboard genérico - redirigir al dashboard específico del rol
          if (pathname === '/dashboard') {
            if (rolUsuario === 'ADMINISTRADOR') {
              return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            } else if (rolUsuario === 'OPERADOR') {
              return NextResponse.redirect(new URL('/operador/dashboard', request.url));
            } else if (rolUsuario === 'DONANTE') {
              return NextResponse.redirect(new URL('/donante/dashboard', request.url));
            } else {
              return NextResponse.redirect(new URL('/user/dashboard', request.url));
            }
          }
        } else {
          // Si no hay perfil, redirigir a login
          const url = new URL('/auth/iniciar-sesion', request.url);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        // Si hay error obteniendo el perfil, redirigir a login
        console.error('Error en middleware al verificar perfil:', error);
        const url = new URL('/auth/iniciar-sesion', request.url);
        return NextResponse.redirect(url);
      }
    }

    // Permitir acceso a la página principal de bienvenida
    // Los usuarios logueados pueden acceder tanto a la página principal como a sus dashboards
    if (pathname === '/') {
      // Si está autenticado, verificar el estado del usuario pero permitir acceso a la página de bienvenida
      if (isAuthenticated && user) {
        try {
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
        } catch (error) {
          console.error('Error verificando perfil en página principal:', error);
        }
      }
      
      // Permitir acceso a la página de bienvenida sin redirecciones automáticas
      return supabaseResponse;
    }

    return supabaseResponse;
  } catch (error: any) {
    // Suprimir logs de errores esperados
    if (error?.code !== 'refresh_token_not_found' && error?.code !== 'ECONNRESET') {
      console.error('Error inesperado en middleware:', error);
    }
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