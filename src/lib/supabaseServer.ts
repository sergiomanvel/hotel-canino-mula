/**
 * Cliente Supabase para uso EXCLUSIVO en servidor.
 *
 * Usa la clave `service_role`, que omite Row Level Security y tiene acceso
 * total a la base de datos. Por eso:
 *   - SOLO debe importarse desde código server-side (endpoints con
 *     `export const prerender = false`, middleware, etc.).
 *   - NUNCA debe importarse desde componentes/islas que lleguen al navegador.
 *   - La clave se lee de `SUPABASE_SERVICE_ROLE_KEY` (sin prefijo PUBLIC_),
 *     por lo que Astro no la incluye en el bundle del cliente.
 *
 * El cliente se crea de forma perezosa (lazy) la primera vez que se llama a
 * `getSupabaseServerClient()`, de modo que el build estático nunca necesita
 * las variables de entorno.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

/**
 * Devuelve un cliente Supabase con privilegios de servidor (service_role).
 * Lanza un error claro si faltan las variables de entorno necesarias.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Falta la variable de entorno PUBLIC_SUPABASE_URL. ' +
        'Copia .env.example a .env y rellénala con los datos de tu proyecto Supabase.'
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      'Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY (secreto de servidor). ' +
        'Defínela en .env (local) o en las variables de entorno del hosting. Nunca la commitees.'
    );
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
