/** Preguntas frecuentes. Se usan en la sección FAQ y en el schema FAQPage. */

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: '¿Cuándo abre Hotel Canino Río Mula?',
    answer:
      'Estamos en fase de próxima apertura en Mula, Murcia. Escríbenos por WhatsApp y te avisamos en cuanto tengamos fecha y disponibilidad.',
  },
  {
    question: '¿Puedo reservar por WhatsApp?',
    answer:
      'Sí. WhatsApp es nuestro canal principal de contacto y reservas. Cuéntanos qué necesita tu perro y te informamos.',
  },
  {
    question: '¿Ofrecéis recogida a domicilio?',
    answer:
      'Sí, ofrecemos recogida de perros a domicilio. Consulta la cobertura para Mula y alrededores escribiéndonos por WhatsApp.',
  },
  {
    question: '¿Tenéis peluquería canina?',
    answer:
      'Sí, contamos con servicio de peluquería canina: baño, corte e higiene adaptados a cada perro.',
  },
  {
    question: '¿Ofrecéis adiestramiento?',
    answer:
      'Sí, ofrecemos adiestramiento canino con un trato profesional. Escríbenos y te contamos cómo trabajamos.',
  },
  {
    question: '¿Dónde está ubicado?',
    answer:
      'Estamos en Mula, Región de Murcia, y damos servicio en la zona y alrededores. Para la ubicación exacta y la cobertura, escríbenos por WhatsApp.',
  },
  {
    question: '¿Qué información debo enviar por WhatsApp?',
    answer:
      'Cuéntanos el servicio que te interesa, las fechas aproximadas y los datos básicos de tu perro (tamaño, raza y necesidades). Con eso te informamos de disponibilidad.',
  },
  {
    question: '¿Qué necesita mi perro para alojarse?',
    answer:
      'Cada perro es diferente. Te confirmaremos los requisitos por WhatsApp según el servicio y las necesidades de tu perro, para que todo esté listo antes de su estancia.',
  },
  {
    question: '¿Puedo consultar disponibilidad antes de la apertura?',
    answer:
      'Sí. Aunque estamos en fase de próxima apertura, puedes escribirnos por WhatsApp para consultar disponibilidad, resolver dudas o dejar tus datos y avisarte en cuanto abramos.',
  },
  {
    question: '¿La recogida a domicilio cubre toda la Región de Murcia?',
    answer:
      'Ofrecemos recogida de perros a domicilio en Mula y alrededores. Para confirmar si llegamos a tu zona concreta de Murcia, escríbenos por WhatsApp y lo comprobamos.',
  },
];
