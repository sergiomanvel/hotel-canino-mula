/**
 * Endpoint de SOLICITUD de reserva — Fase 2A.
 *
 * Recibe el envío del formulario (ReservationForm.astro), valida en servidor
 * y guarda la solicitud en Supabase usando la clave service_role.
 *
 * - Se ejecuta on-demand (no se prerenderiza).
 * - No envía notificaciones por email: el propietario revisa las reservas en /admin.
 * - No expone secretos en las respuestas de error.
 */
import type { APIRoute } from 'astro';
import { getSupabaseServerClient } from '../../lib/supabaseServer';

export const prerender = false;

// Límites prudentes para evitar payloads abusivos.
const MAX_SHORT = 200;
const MAX_LONG = 2000;
const MAX_AGE = 50;
const MAX_DETAILS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Valores técnicos aceptados para los campos del perfil del perro. El servidor
// es la autoridad: cualquier valor fuera de estas listas se descarta (se guarda
// NULL), aunque el HTML del cliente haya sido manipulado. Las etiquetas en
// español viven en la interfaz; aquí solo viajan claves estables.
const SEX = ['male', 'female'] as const;
const YES_NO = ['yes', 'no'] as const;
const YES_NO_UNKNOWN = ['yes', 'no', 'unknown'] as const;
const YES_NO_DEPENDS = ['yes', 'no', 'depends'] as const;

/** Lee un campo de texto del FormData, recortado y acotado en longitud. */
function field(form: FormData, name: string, max = MAX_SHORT): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Lee un campo de texto libre y lo deja listo para guardar: recortado, acotado
 * y sin etiquetas HTML. Devuelve `null` cuando queda vacío, para no llenar la
 * tabla de cadenas vacías (las columnas nuevas son nullable).
 */
function optionalText(form: FormData, name: string, max: number): string | null {
  const value = field(form, name, max).replace(/<[^>]*>/g, '').trim();
  return value || null;
}

/**
 * Lee un campo de opción cerrada OPCIONAL.
 *
 *   - ausente o vacío  -> `null` (la columna es nullable y el campo opcional);
 *   - valor permitido  -> se persiste;
 *   - valor manipulado -> error de validación (la petición se rechaza con 400).
 *
 * La whitelist sirve para VALIDAR, no para tragarse en silencio un input
 * inválido: si alguien edita el HTML y envía otra cosa, es un error, no un
 * `null`. El valor recibido nunca se vuelca en el mensaje (podría contener
 * datos personales o contenido arbitrario); solo se nombra el campo.
 */
function optionalEnum(
  form: FormData,
  name: string,
  allowed: readonly string[],
  errors: string[],
  label: string
): string | null {
  const value = form.get(name);
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!allowed.includes(trimmed)) {
    errors.push(`La respuesta de «${label}» no es válida.`);
    return null;
  }
  return trimmed;
}

/**
 * Igual que `optionalEnum`, pero el campo es obligatorio en el formulario
 * público. Distingue los dos motivos de rechazo para dar un mensaje útil:
 * falta respuesta, o la respuesta recibida no es una de las válidas.
 *
 * La columna sigue siendo nullable en la base de datos por compatibilidad con
 * las reservas anteriores a esta ampliación; la obligatoriedad se aplica aquí.
 */
function requiredEnum(
  form: FormData,
  name: string,
  allowed: readonly string[],
  errors: string[],
  missingMessage: string,
  label: string
): string | null {
  const value = form.get(name);
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (!trimmed) {
    errors.push(missingMessage);
    return null;
  }
  if (!allowed.includes(trimmed)) {
    errors.push(`La respuesta de «${label}» no es válida.`);
    return null;
  }
  return trimmed;
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

  // --- Perfil del perro (bloques 03 y 04 del formulario) ---
  // Los errores se acumulan ya desde la lectura: un valor manipulado en un
  // campo de opción cerrada es un error de validación, no un `null` silencioso.
  const errors: string[] = [];

  const dog_sex = requiredEnum(form, 'dog_sex', SEX, errors, 'Indica el sexo de tu perro.', 'Sexo');
  const dog_age = optionalText(form, 'dog_age', MAX_AGE);
  const dog_neutered = optionalEnum(form, 'dog_neutered', YES_NO_UNKNOWN, errors, 'Esterilización');
  const dog_vaccinations_up_to_date = requiredEnum(
    form,
    'dog_vaccinations_up_to_date',
    YES_NO_UNKNOWN,
    errors,
    'Indícanos si tu perro tiene las vacunas al día.',
    'Vacunas al día'
  );

  const dog_social_with_dogs = optionalEnum(
    form,
    'dog_social_with_dogs',
    YES_NO_DEPENDS,
    errors,
    'Sociable con otros perros'
  );
  const dog_social_with_people = optionalEnum(
    form,
    'dog_social_with_people',
    YES_NO_DEPENDS,
    errors,
    'Sociable con personas que no conoce'
  );
  const dog_aggression_history = optionalEnum(
    form,
    'dog_aggression_history',
    YES_NO,
    errors,
    'Conductas agresivas anteriores'
  );
  const dog_has_fears = optionalEnum(form, 'dog_has_fears', YES_NO, errors, 'Miedos importantes');
  const dog_escape_attempts = optionalEnum(
    form,
    'dog_escape_attempts',
    YES_NO,
    errors,
    'Intenta escapar o saltar vallas'
  );
  const dog_separation_anxiety = optionalEnum(
    form,
    'dog_separation_anxiety',
    YES_NO_UNKNOWN,
    errors,
    'Ansiedad por separación'
  );
  const dog_has_allergies_or_intolerances = optionalEnum(
    form,
    'dog_has_allergies_or_intolerances',
    YES_NO_UNKNOWN,
    errors,
    'Alergias o intolerancias'
  );
  const dog_feeding_type = optionalText(form, 'dog_feeding_type', MAX_SHORT);
  const dog_brings_own_food = optionalEnum(
    form,
    'dog_brings_own_food',
    YES_NO_UNKNOWN,
    errors,
    'Traerá su propia comida'
  );

  // Los detalles solo tienen sentido cuando la respuesta asociada es "sí".
  // Con JavaScript el campo va deshabilitado y ni siquiera se envía; sin
  // JavaScript el usuario podría rellenarlo y responder "no", así que el
  // servidor descarta el texto huérfano para no guardar datos incoherentes.
  const dog_aggression_details =
    dog_aggression_history === 'yes'
      ? optionalText(form, 'dog_aggression_details', MAX_DETAILS)
      : null;
  const dog_fears_details =
    dog_has_fears === 'yes' ? optionalText(form, 'dog_fears_details', MAX_DETAILS) : null;
  const dog_allergies_or_intolerances_details =
    dog_has_allergies_or_intolerances === 'yes'
      ? optionalText(form, 'dog_allergies_or_intolerances_details', MAX_DETAILS)
      : null;

  // --- Validación ---
  if (!owner_name) errors.push('Indica tu nombre.');
  if (!owner_phone) errors.push('Indica un teléfono de contacto.');
  if (!owner_email) errors.push('Indica tu email.');
  else if (!EMAIL_RE.test(owner_email)) errors.push('El email no parece válido.');
  if (!dog_name) errors.push('Indica el nombre de tu perro.');
  if (!dog_size_or_breed) errors.push('Indica el tamaño o la raza de tu perro.');
  // `dog_sex` y `dog_vaccinations_up_to_date` los valida `requiredEnum` arriba,
  // que ya distingue "falta respuesta" de "respuesta manipulada". Aquí solo
  // queda la edad, que es texto libre obligatorio.
  //
  // De las vacunas solo se exige que haya respuesta: "no" y "no lo sé" son
  // respuestas válidas y NUNCA rechazan la solicitud. La valoración es manual.
  if (!dog_age) errors.push('Indica la edad aproximada de tu perro.');

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
      // Perfil del perro (migración 0003). Todas las columnas son nullable.
      dog_sex,
      dog_age,
      dog_neutered,
      dog_vaccinations_up_to_date,
      dog_social_with_dogs,
      dog_social_with_people,
      dog_aggression_history,
      dog_aggression_details,
      dog_has_fears,
      dog_fears_details,
      dog_escape_attempts,
      dog_separation_anxiety,
      dog_has_allergies_or_intolerances,
      dog_allergies_or_intolerances_details,
      dog_feeding_type,
      dog_brings_own_food,
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
