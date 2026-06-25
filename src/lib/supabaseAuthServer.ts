/**
 * Cliente Supabase para AUTENTICACIÓN del panel /admin (lado servidor, SSR).
 *
 * - Usa la clave ANÓNIMA (`PUBLIC_SUPABASE_ANON_KEY`), NO la service_role.
 *   El acceso a datos queda gobernado por RLS según la sesión del usuario.
 * - Gestiona la sesión en cookies vía @supabase/ssr (cookie-based auth),
 *   leyendo de la cabecera Cookie de la petición y escribiendo en Astro.cookies.
 * - NUNCA debe usar SUPABASE_SERVICE_ROLE_KEY ni llegar al bundle del cliente.
 */
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export interface CookieContext {
  request: Request;
  cookies: AstroCookies;
}

function readEnv() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url) {
    throw new Error(
      'Falta la variable de entorno PUBLIC_SUPABASE_URL. Revisa tu .env (copia .env.example).'
    );
  }
  if (!anonKey) {
    throw new Error(
      'Falta la variable de entorno PUBLIC_SUPABASE_ANON_KEY. Revisa tu .env (copia .env.example).'
    );
  }
  return { url, anonKey };
}

/**
 * Crea un cliente Supabase con la sesión sincronizada con las cookies de Astro.
 */
export function createSupabaseServerClient({ request, cookies }: CookieContext) {
  const { url, anonKey } = readEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map(
          ({ name, value }) => ({ name, value: value ?? '' })
        );
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Devuelve el usuario autenticado (validado contra el servidor de Auth) o null.
 * Usa getUser() —no getSession()— porque verifica el token, que es lo seguro
 * para proteger rutas en servidor.
 */
export async function getSessionUser(context: CookieContext) {
  const supabase = createSupabaseServerClient(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
