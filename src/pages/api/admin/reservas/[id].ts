/**
 * Endpoint de gestión de una reserva (panel admin).
 * Actualiza SOLO `status` e `internal_notes`. Usa el cliente SSR con la sesión
 * del usuario (rol authenticated); la autorización la garantiza RLS (is_admin()).
 * Nunca usa service_role.
 */
import type { APIRoute } from 'astro';
import { createSupabaseServerClient } from '../../../../lib/supabaseAuthServer';

export const prerender = false;

const STATUSES = ['nueva', 'contactada', 'confirmada', 'rechazada'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_NOTES = 2000;

export const POST: APIRoute = async (context) => {
  const { params, request, redirect } = context;
  const id = params.id;

  if (!id || !UUID_RE.test(id)) {
    return new Response('Identificador no válido.', { status: 400 });
  }

  const supabase = createSupabaseServerClient(context);

  // Comprobación de sesión (defensa adicional al middleware).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response('No autorizado', { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response('Datos no válidos.', { status: 400 });
  }

  const status = form.get('status');
  const notesRaw = form.get('internal_notes');

  if (typeof status !== 'string' || !STATUSES.includes(status)) {
    return new Response('Estado no válido.', { status: 400 });
  }

  let internal_notes: string | null = null;
  if (typeof notesRaw === 'string') {
    const trimmed = notesRaw.trim();
    if (trimmed.length > MAX_NOTES) {
      return new Response('Las notas internas son demasiado largas.', { status: 400 });
    }
    internal_notes = trimmed.length > 0 ? trimmed : null;
  }

  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status, internal_notes })
      .eq('id', id)
      .select('id');

    if (error) {
      console.error('[api/admin/reservas/:id] Error al actualizar:', error.message);
      return new Response('No hemos podido guardar los cambios.', { status: 500 });
    }

    // RLS puede haber filtrado la fila (usuario no admin o id inexistente):
    // update afecta a 0 filas sin error.
    if (!data || data.length === 0) {
      return new Response('Reserva no encontrada.', { status: 404 });
    }
  } catch (err) {
    console.error('[api/admin/reservas/:id] Error inesperado:', err instanceof Error ? err.message : 'desconocido');
    return new Response('No hemos podido procesar la solicitud.', { status: 500 });
  }

  return redirect(`/admin/reservas/${id}?updated=1`, 303);
};
