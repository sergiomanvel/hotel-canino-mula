/** Servicios del hotel canino. Centralizado para reutilizar en cards y schema. */

export interface Service {
  id: string;
  title: string;
  description: string;
  /** Clave del icono (ver Services.astro). */
  icon: string;
  /** serviceType para el schema JSON-LD. */
  serviceType: string;
}

export const services: Service[] = [
  {
    id: 'hotel',
    title: 'Hotel canino',
    description:
      'Hotel y residencia canina en Mula para estancias cuando viajas o lo necesitas. Cuidado cercano y atención diaria.',
    icon: 'home',
    serviceType: 'Hotel canino / Residencia canina',
  },
  {
    id: 'guarderia',
    title: 'Guardería canina',
    description:
      'Guardería canina en Mula, días completos o por horas. Tu perro acompañado y atendido mientras tú estás fuera.',
    icon: 'sun',
    serviceType: 'Guardería canina',
  },
  {
    id: 'recogida',
    title: 'Recogida a domicilio',
    description:
      'Recogida de perros a domicilio en Mula y alrededores de Murcia. Recogemos y llevamos a tu perro; consulta tu zona.',
    icon: 'van',
    serviceType: 'Recogida de perros a domicilio',
  },
  {
    id: 'peluqueria',
    title: 'Peluquería canina',
    description:
      'Peluquería canina en Mula: baño, corte e higiene adaptados a cada raza y tipo de pelo.',
    icon: 'scissors',
    serviceType: 'Peluquería canina',
  },
  {
    id: 'adiestramiento',
    title: 'Adiestramiento',
    description:
      'Adiestramiento canino en Mula: obediencia y comportamiento con un trato profesional y paciente.',
    icon: 'paw',
    serviceType: 'Adiestramiento canino',
  },
  {
    id: 'otros',
    title: 'Otros servicios',
    description:
      'Cuidados a medida para tu perro. Cuéntanos qué necesita y te informamos.',
    icon: 'heart',
    serviceType: 'Otros servicios para perros',
  },
];
