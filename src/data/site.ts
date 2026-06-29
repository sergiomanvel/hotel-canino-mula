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
  status: 'Próxima apertura',

  // Ubicación (sin dirección exacta hasta confirmar)
  locality: 'Mula',
  region: 'Región de Murcia',
  regionShort: 'Murcia',
  country: 'España',
  countryCode: 'ES',

  // Contacto
  whatsappDisplay: '+34 722 713 456',
  whatsappNumber: '34722713456',
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

/** Mensaje prellenado para WhatsApp (codificado en el enlace). */
export const WHATSAPP_MESSAGE = 'Hola, quiero información sobre Hotel Canino Río Mula.';

/** Enlace único y obligatorio para todos los CTA de WhatsApp. */
export const WHATSAPP_LINK =
  'https://wa.me/34722713456?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20Hotel%20Canino%20R%C3%ADo%20Mula';
