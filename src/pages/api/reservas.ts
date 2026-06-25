/**
 * Endpoint de SOLICITUD de reserva — Fase 2A.
 *
 * Recibe el envío del formulario (ReservationForm.astro), valida en servidor
 * y guarda la solicitud en Supabase usando la clave service_role.
 *
 * - Se ejecuta on-demand (no se prerenderiza).
 * - No envía emails todavía (eso será Fase 2C con Resend).
 * - No expone secretos en las respuestas de error.
 */
import type { APIRoute } from 'astro';
import { getSupabaseServerClient } from '../../lib/supabaseServer';

export const prerender = false;

// Límites prudentes para evitar payloads abusivos.
const MAX_SHORT = 200;
const MAX_LONG = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Lee un campo de texto del FormData, recortado y acotado en longitud. */
function field(form: FormData, name: string, max = MAX_SHORT): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Un checkbox HTML envía "on" cuando está marcado; ausente si no. */
function checkbox(form: FormData, name: string): boolean {
  const value = form.get(name);
  return value === 'on' || value === 'true' || value === '1';
}

/** Respuesta de error de validación: HTML simple, legible, sin dependencias. */
function validationError(errors: string[]): Response {
  const items = errors.map((e) => `<li>${e}</li>`).join('');
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Revisa el formulario</title></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:3rem auto;padding:0 1.25rem;color:#25372c;line-height:1.5">
<h1 style="font-size:1.5rem">No hemos podido enviar tu solicitud</h1>
<p>Revisa estos puntos y vuelve a intentarlo:</p>
<ul>${items}</ul>
<p><a href="/#reservas" style="color:#c06a45;font-weight:700">← Volver al formulario</a></p>
</body></html>`;
  return new Response(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request, redirect }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return validationError(['No se han recibido los datos del formulario.']);
  }

  // Honeypot antispam: si viene relleno, es un bot. Fingimos éxito sin guardar.
  if (field(form, '_gotcha')) {
    return redirect('/reserva-recibida', 303);
  }

  // --- Lectura de campos ---
  const owner_name = field(form, 'owner_name');
  const owner_phone = field(form, 'owner_phone');
  const owner_email = field(form, 'owner_email');
  const dog_name = field(form, 'dog_name');
  const dog_size_or_breed = field(form, 'dog_size_or_breed');
  const start_date = field(form, 'start_date', 10);
  const end_date = field(form, 'end_date', 10);
  const dog_notes = field(form, 'dog_notes', MAX_LONG);
  const accepts_privacy = checkbox(form, 'accepts_privacy');
  const accepts_photos = checkbox(form, 'accepts_photos');

  // --- Validación ---
  const errors: string[] = [];
  if (!owner_name) errors.push('Indica tu nombre.');
  if (!owner_phone) errors.push('Indica un teléfono de contacto.');
  if (!owner_email) errors.push('Indica tu email.');
  else if (!EMAIL_RE.test(owner_email)) errors.push('El email no parece válido.');
  if (!dog_name) errors.push('Indica el nombre de tu perro.');
  if (!dog_size_or_breed) errors.push('Indica el tamaño o la raza de tu perro.');

  if (!start_date) errors.push('Indica la fecha de entrada.');
  else if (!DATE_RE.test(start_date)) errors.push('La fecha de entrada no es válida.');
  if (!end_date) errors.push('Indica la fecha de salida.');
  else if (!DATE_RE.test(end_date)) errors.push('La fecha de salida no es válida.');
  if (
    start_date &&
    end_date &&
    DATE_RE.test(start_date) &&
    DATE_RE.test(end_date) &&
    end_date < start_date
  ) {
    errors.push('La fecha de salida debe ser igual o posterior a la de entrada.');
  }

  if (!accepts_privacy) {
    errors.push('Debes aceptar la política de privacidad para enviar la solicitud.');
  }

  if (errors.length > 0) return validationError(errors);

  // --- Inserción en Supabase (solo los campos necesarios; nunca _gotcha) ---
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('reservations').insert({
      owner_name,
      owner_phone,
      owner_email,
      dog_name,
      dog_size_or_breed: dog_size_or_breed || null,
      start_date,
      end_date,
      dog_notes: dog_notes || null,
      accepts_privacy,
      accepts_photos,
      // status -> default 'nueva' en la base de datos.
    });

    if (error) {
      // Log server-side para diagnóstico; sin filtrar detalles al cliente.
      console.error('[api/reservas] Error al insertar la reserva:', error.message);
      return new Response(
        'No hemos podido guardar tu solicitud en este momento. Inténtalo de nuevo en unos minutos.',
        { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }
  } catch (err) {
    console.error('[api/reservas] Error inesperado:', err instanceof Error ? err.message : err);
    return new Response(
      'No hemos podido procesar tu solicitud en este momento. Inténtalo de nuevo en unos minutos.',
      { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  return redirect('/reserva-recibida', 303);
};
