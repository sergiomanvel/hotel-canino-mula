/**
 * Endpoint de logout del panel /admin.
 * Cierra la sesión en Supabase Auth y limpia las cookies (vía @supabase/ssr),
 * luego redirige a la página de login.
 */
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabaseAuthServer';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { redirect } = context;
  try {
    const supabase = createSupabaseServerClient(context);
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[api/admin/logout] Error al cerrar sesión:', err instanceof Error ? err.message : 'desconocido');
  }
  return redirect('/admin/login', 303);
};
