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

  // Dominio (placeholder — actualizar al publicar)
  url: 'https://hotelcaninoriomula.es',

  // SEO
  title: 'Hotel Canino en Mula, Murcia | Hotel Canino Río Mula',
  description:
    'Hotel canino, guardería, peluquería, adiestramiento y recogida a domicilio en Mula, Región de Murcia. Próxima apertura. Escríbenos por WhatsApp y te informamos.',
} as const;

/** Mensaje prellenado para WhatsApp (codificado en el enlace). */
export const WHATSAPP_MESSAGE = 'Hola, quiero información sobre Hotel Canino Río Mula.';

/** Enlace único y obligatorio para todos los CTA de WhatsApp. */
export const WHATSAPP_LINK =
  'https://wa.me/34722713456?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20Hotel%20Canino%20R%C3%ADo%20Mula';
