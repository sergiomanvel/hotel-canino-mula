/**
 * Características del hospedaje canino (servicio ÚNICO del negocio).
 * El negocio solo ofrece hotel / residencia canina: aquí describimos en qué
 * consiste el alojamiento, no servicios distintos.
 *
 * NOTA (propietario): redactado de forma prudente, sin inventar instalaciones
 * concretas, plazas, horarios ni políticas. Ajusta cuando lo confirmes.
 */

export interface HospedajeFeature {
  id: string;
  title: string;
  description: string;
  /** Clave del icono (ver HospedajeSection.astro). */
  icon: string;
}

export const hospedajeFeatures: HospedajeFeature[] = [
  {
    id: 'estancias',
    title: 'Estancias por días',
    description:
      'Hospedaje para tu perro cuando viajas o lo necesitas, durante el tiempo que precises.',
    icon: 'home',
  },
  {
    id: 'atencion',
    title: 'Atención cercana',
    description:
      'Cuidado y atención diaria, adaptados al carácter y las necesidades de cada perro.',
    icon: 'heart',
  },
  {
    id: 'descanso',
    title: 'Espacios para descansar',
    description:
      'Un entorno tranquilo pensado para que tu perro esté cómodo y a salvo.',
    icon: 'moon',
  },
  {
    id: 'comunicacion',
    title: 'Comunicación contigo',
    description:
      'Resolvemos tus dudas antes y durante la estancia para que estés tranquilo.',
    icon: 'chat',
  },
];

/** serviceType único para el schema JSON-LD. */
export const HOSPEDAJE_SERVICE_TYPE = 'Hotel canino / Residencia canina';
