/**
 * Endpoint de login del panel /admin.
 * Valida email+contraseña contra Supabase Auth y, si es correcto, persiste la
 * sesión en cookies (vía @supabase/ssr). No registra la contraseña ni filtra
 * detalles del error de autenticación.
 */
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../lib/supabaseAuthServer';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request, redirect } = context;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect('/admin/login?error=1', 303);
  }

  const email = form.get('email');
  const password = form.get('password');

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return redirect('/admin/login?error=1', 303);
  }

  try {
    const supabase = createSupabaseServerClient(context);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return redirect('/admin/login?error=1', 303);
    }
  } catch (err) {
    // Log de diagnóstico sin datos sensibles ni contraseña.
    console.error('[api/admin/login] Error de autenticación:', err instanceof Error ? err.message : 'desconocido');
    return redirect('/admin/login?error=1', 303);
  }

  return redirect('/admin', 303);
};
