/** Preguntas frecuentes. Se usan en la sección FAQ y en el schema FAQPage. */

import { site } from './site';

export interface FaqItem {
  question: string;
  answer: string;
  /** Enlace externo opcional que se muestra tras la respuesta. */
  link?: { href: string; label: string };
}

export const faqs: FaqItem[] = [
  {
    question: '¿Estáis abiertos en Mula?',
    answer:
      'Sí, estamos abiertos en Mula, Región de Murcia. Envíanos tu solicitud de reserva y te confirmamos la disponibilidad para las fechas que necesites.',
  },
  {
    question: '¿Cómo solicito una reserva?',
    answer:
      'Rellena el formulario de solicitud de reserva de esta web con tus datos y los de tu perro. Es nuestro canal principal de reservas.',
  },
  {
    question: '¿La reserva queda confirmada al enviar el formulario?',
    answer:
      'No. El formulario es una solicitud: tu reserva no queda confirmada hasta que te respondamos personalmente para revisar disponibilidad y cerrar los detalles.',
  },
  {
    question: '¿Qué información debo incluir sobre mi perro?',
    answer:
      'Cuéntanos el nombre de tu perro, su tamaño o raza, las fechas aproximadas de entrada y salida y cualquier necesidad importante. Con eso podemos informarte mejor de la disponibilidad.',
  },
  {
    question: '¿Cómo consulto la disponibilidad?',
    answer:
      'Envíanos tu solicitud de reserva con las fechas aproximadas y te confirmamos la disponibilidad. También puedes usar el formulario para resolver cualquier duda antes de reservar.',
  },
  {
    question: '¿Se publicarán fotos de mi perro?',
    answer:
      'Solo con tu permiso. Las fotos de perros se publican únicamente si das tu consentimiento; puedes indicarlo en el formulario de reserva.',
  },
  {
    question: '¿Dónde está ubicado Hotel Canino Río Mula?',
    answer:
      'Estamos en Ctra. de Pliego, 30170 Mula, Murcia. Puedes consultar la ubicación en Google Maps antes de solicitar la reserva.',
    link: { href: site.mapsUrl, label: 'Ver ubicación en Google Maps' },
  },
];
