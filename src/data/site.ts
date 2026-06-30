/**
 * Datos centrales del negocio.
 * Edita aquí una sola vez y se actualiza en toda la web.
 *
 * NOTA (propietario): no se inventan datos. Cuando dispongas de
 * dirección exacta, horarios, precios o fechas, añádelos donde corresponda.
 */

export const site = {
  name: 'Hotel Canino Río Mula',
  shortName: 'Hotel Canino Río Mula',
  status: 'Abierto',

  // Ubicación (dirección real confirmada)
  locality: 'Mula',
  region: 'Región de Murcia',
  regionShort: 'Murcia',
  country: 'España',
  countryCode: 'ES',
  streetAddress: 'Ctra. de Pliego',
  postalCode: '30170',
  addressDisplay: 'Ctra. de Pliego, 30170 Mula, Murcia',
  mapsUrl: 'https://maps.app.goo.gl/v5tfVDUWd6rSkLdG9',

  // Contacto
  instagramHandle: '@hotelcaninoriomula',
  instagramUrl: 'https://instagram.com/hotelcaninoriomula',

  // Dominio del sitio (se usa en el JSON-LD). Se toma de PUBLIC_SITE_URL, igual
  // que `site` en astro.config.mjs, para usar un dominio provisional .vercel.app
  // sin tocar código; si no existe, cae al dominio definitivo como fallback.
  url: import.meta.env.PUBLIC_SITE_URL ?? 'https://hotelcaninoriomula.es',

  // SEO
  title: 'Hotel y Residencia Canina en Mula, Murcia | Hotel Canino Río Mula',
  description:
    'Hotel y residencia canina en Mula, Región de Murcia: hospedaje y alojamiento para tu perro con cuidado cercano. Solicita tu reserva online; te confirmamos personalmente.',
} as const;

/** Ancla de la sección de solicitud de reserva (CTA principal). */
export const RESERVATION_ANCHOR = '#reservas';
