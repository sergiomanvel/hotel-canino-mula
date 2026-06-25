/**
 * Middleware de protección del área de administración.
 *
 * - Protege /admin, /admin/* y /api/admin/*.
 * - Excepciones públicas: /admin/login y /api/admin/login.
 * - Sin sesión: las páginas /admin* redirigen a /admin/login; los endpoints
 *   /api/admin* devuelven 401.
 * - Con sesión, si se visita /admin/login se redirige a /admin (lo más simple).
 * - No toca la landing pública, /api/reservas, sitemap ni páginas estáticas:
 *   para esas rutas se sale de inmediato con next() sin crear cliente Supabase
 *   (así el build estático no necesita variables de entorno).
 */
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerClient } from './lib/supabaseAuthServer';

const LOGIN_PATHS = ['/admin/login', '/api/admin/login'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminApi = pathname.startsWith('/api/admin/');

  // Fuera del área admin: no hacemos nada.
  if (!isAdminPage && !isAdminApi) {
    return next();
  }

  const supabase = createSupabaseServerClient(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rutas de login: públicas. Si ya hay sesión, atajo al panel.
  if (LOGIN_PATHS.includes(pathname)) {
    if (user && pathname === '/admin/login') {
      return context.redirect('/admin', 303);
    }
    return next();
  }

  // Resto del área admin: requiere sesión.
  if (!user) {
    if (isAdminApi) {
      return new Response('No autorizado', { status: 401 });
    }
    return context.redirect('/admin/login', 303);
  }

  return next();
});
