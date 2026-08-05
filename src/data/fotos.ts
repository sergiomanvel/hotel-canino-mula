/**
 * Fotografías reales del hotel (dirección visual «Ribera editorial documental»).
 *
 * Los originales viven fuera de Git, en `media-source/` (ignorada). Aquí solo
 * entran las versiones finales ya recortadas y sin metadatos, importadas con
 * `astro:assets` para que Astro infiera ancho y alto en build y no haya CLS.
 *
 * NOTA (propietario): los `alt` describen únicamente lo que se ve. No afirman
 * servicios, capacidad ni horarios, y no atribuyen nombre, raza ni cargo a
 * ninguna persona o animal.
 */

import boxesContraluz from '../assets/fotos/boxes-contraluz.jpg';
import boxesDetalle from '../assets/fotos/boxes-detalle.jpg';
import casetaExterior from '../assets/fotos/caseta-exterior.jpg';
import portonMural from '../assets/fotos/porton-mural.jpg';
import vistaAereaMula from '../assets/fotos/vista-aerea-mula.jpg';

export interface Foto {
  src: ImageMetadata;
  /** Texto alternativo: solo contenido visible. */
  alt: string;
  /** Pie visible. Se omite cuando la imagen no necesita apoyo textual. */
  caption?: string;
}

export const fotos = {
  /** Hero. Candidata LCP: es la única imagen con carga prioritaria. */
  boxesContraluz: {
    src: boxesContraluz,
    alt: 'Fila de boxes individuales cubiertos con velas de sombra, a contraluz al final de la tarde.',
  },

  /** Hospedaje. */
  boxesDetalle: {
    src: boxesDetalle,
    alt: 'Dos boxes individuales contiguos, uno con la puerta abierta; dentro, una jardinera y una bombilla colgada.',
    caption: 'Cerramiento, drenaje y sombra.',
  },

  /** Banda de entorno, entre confianza y proceso de reserva. */
  vistaAereaMula: {
    src: vistaAereaMula,
    alt: 'Vista aérea al atardecer del recinto vallado, con módulos y velas de sombra, rodeado de campos de cultivo y montañas.',
    caption: 'Ctra. de Pliego, Mula. La huerta y la sierra al fondo.',
  },

  /** Galería, primera pieza del díptico. */
  casetaExterior: {
    src: casetaExterior,
    alt: 'Caseta de madera pintada de blanco sobre césped, junto a la valla de cañizo.',
    caption: 'Una de las zonas exteriores.',
  },

  /** Galería, segunda pieza del díptico. Última fotografía de la página. */
  portonMural: {
    src: portonMural,
    alt: 'Portón metálico blanco con un mural pintado a mano: dos perros, un castillo y el rótulo Hotel Canino Río Mula.',
    caption: 'La entrada.',
  },
} as const satisfies Record<string, Foto>;
