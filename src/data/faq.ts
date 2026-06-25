/** Preguntas frecuentes. Se usan en la sección FAQ y en el schema FAQPage. */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: '¿Cuándo abre Hotel Canino Río Mula?',
    answer:
      'Estamos en fase de próxima apertura en Mula, Murcia. Envíanos tu solicitud de reserva o escríbenos por WhatsApp y te avisamos en cuanto tengamos fecha y disponibilidad.',
  },
  {
    question: '¿Cómo solicito una reserva?',
    answer:
      'Rellena el formulario de solicitud de reserva de esta web con tus datos y los de tu perro. Es nuestro canal principal. También puedes escribirnos por WhatsApp si prefieres una consulta rápida.',
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
    question: '¿Puedo consultar disponibilidad antes de la apertura?',
    answer:
      'Sí. Aunque estamos en fase de próxima apertura, puedes enviarnos tu solicitud o escribirnos por WhatsApp para consultar disponibilidad, resolver dudas o que te avisemos cuando abramos.',
  },
  {
    question: '¿Se publicarán fotos de mi perro?',
    answer:
      'Solo con tu permiso. Las fotos de perros se publican únicamente si das tu consentimiento; puedes indicarlo en el formulario de reserva.',
  },
  {
    question: '¿Dónde está ubicado Hotel Canino Río Mula?',
    answer:
      'Estamos en Mula, Región de Murcia. Para la ubicación exacta, envíanos tu solicitud de reserva o escríbenos por WhatsApp y te la facilitamos.',
  },
];
