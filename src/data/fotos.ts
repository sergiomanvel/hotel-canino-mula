/**
 * Fotografías reales del hotel (dirección visual «Ribera editorial documental»).
 *
 * Las 28 fotografías del reportaje están publicadas: cinco en las secciones
 * editoriales (hero, hospedaje, entorno y las dos que ya abrían la galería) y
 * las 23 restantes en la galería completa. Ninguna queda oculta.
 *
 * Los originales viven fuera de Git, en `media-source/` (ignorada). Aquí entran
 * dos cosas distintas, importadas con `astro:assets` para que Astro infiera
 * ancho y alto en build y no haya CLS:
 *
 *   - `src`      lo que se muestra. Para las cinco destacadas es un recorte
 *                editorial; para el resto, el propio máster completo.
 *   - `completa` el máster a resolución original, destino del enlace «abrir
 *                fotografía completa». Las 28 fichas tienen uno.
 *
 * Los másteres de `assets/fotos/completas/` los produce `scripts/procesar-fotos.mjs`
 * sin recomprimir: copia los datos de imagen del original y solo descarta los
 * segmentos de metadatos, de modo que los píxeles son idénticos al original.
 *
 * El identificador `id` (P001–P028) es el del inventario del reportaje y sirve
 * para rastrear cada pieza hasta su original. Los nombres de archivo originales
 * no se publican.
 *
 * NOTA (propietario): los `alt` describen únicamente lo que se ve. No afirman
 * servicios, capacidad ni horarios, y no atribuyen nombre, raza ni cargo a
 * ninguna persona o animal.
 */

// Recortes editoriales de las cinco destacadas (Hero, Hospedaje, Entorno y
// cabecera de Galería). Son las composiciones aprobadas: no se regeneran.
import boxesContraluz from '../assets/fotos/boxes-contraluz.jpg';
import boxesDetalle from '../assets/fotos/boxes-detalle.jpg';
import casetaExterior from '../assets/fotos/caseta-exterior.jpg';
import portonMural from '../assets/fotos/porton-mural.jpg';
import vistaAereaMula from '../assets/fotos/vista-aerea-mula.jpg';

// Másteres completos, a resolución original y sin recomprimir.
import arcoArcoiris from '../assets/fotos/completas/arco-de-arcoiris.jpg';
import bajoLaCarpaAbierto from '../assets/fotos/completas/bajo-la-carpa-plano-abierto.jpg';
import boxesContraluzCompleta from '../assets/fotos/completas/boxes-contraluz-completa.jpg';
import boxesDetalleCompleta from '../assets/fotos/completas/boxes-detalle-completa.jpg';
import casetaExteriorCompleta from '../assets/fotos/completas/caseta-exterior-completa.jpg';
import conversacionCarpa from '../assets/fotos/completas/conversacion-bajo-la-carpa.jpg';
import dosPerros from '../assets/fotos/completas/dos-perros-hocico-con-hocico.jpg';
import grupoRamos from '../assets/fotos/completas/grupo-ramos-valla.jpg';
import microBotella from '../assets/fotos/completas/micro-y-botella-de-agua.jpg';
import microMesaSonido from '../assets/fotos/completas/micro-y-mesa-de-sonido.jpg';
import microPlanoCorto from '../assets/fotos/completas/micro-plano-corto.jpg';
import microPlanoMedio from '../assets/fotos/completas/micro-plano-medio.jpg';
import perroBlancoArnes from '../assets/fotos/completas/perro-blanco-arnes-de-cuadros.jpg';
import perroMarronArnes from '../assets/fotos/completas/perro-marron-arnes-verde.jpg';
import perroPiscina from '../assets/fotos/completas/perro-piscina-plegable.jpg';
import perroPiscinaJuguete from '../assets/fotos/completas/perro-piscina-con-juguete.jpg';
import portonMuralCompleta from '../assets/fotos/completas/porton-mural-completa.jpg';
import posadoPorton from '../assets/fotos/completas/posado-junto-al-porton.jpg';
import publicoAplaudiendo from '../assets/fotos/completas/publico-aplaudiendo.jpg';
import ramoPlaca from '../assets/fotos/completas/ramo-y-placa.jpg';
import ramosPlacaTres from '../assets/fotos/completas/ramos-y-placa-tres-personas.jpg';
import retratoManoAbierta from '../assets/fotos/completas/retrato-chaleco-mano-abierta.jpg';
import retratoManosJuntas from '../assets/fotos/completas/retrato-chaleco-manos-juntas.jpg';
import retratoVallaVerde from '../assets/fotos/completas/retrato-valla-verde.jpg';
import risaPieMicro from '../assets/fotos/completas/risa-junto-al-pie-de-micro.jpg';
import vistaAereaCompleta from '../assets/fotos/completas/vista-aerea-completa.jpg';
import vistaAereaLogotipo from '../assets/fotos/completas/vista-aerea-con-logotipo.jpg';

/** Dónde vive cada fotografía en la home. */
export type Ubicacion = 'hero' | 'hospedaje' | 'entorno' | 'galeria';

/**
 * Bloques factuales de la galería. Se mantienen separados para no presentar
 * las fotografías del acto como funcionamiento cotidiano.
 */
export type GrupoGaleria = 'perros' | 'apertura';

export interface Foto {
  /** Identificador de inventario del reportaje (P001–P028). */
  id: string;
  /** Lo que se muestra: recorte editorial o el propio máster completo. */
  src: ImageMetadata;
  /** Máster a resolución original, destino del enlace de tamaño completo. */
  completa: ImageMetadata;
  /** Texto alternativo: solo contenido visible. */
  alt: string;
  /** Pie visible. Se omite cuando la imagen no necesita apoyo textual. */
  caption?: string;
  placement: Ubicacion;
}

/** Texto accesible del enlace al máster. Único para las 28 fichas. */
export const ABRIR_COMPLETA = 'Abrir fotografía completa en una pestaña nueva';

export interface FotoGaleria extends Foto {
  placement: 'galeria';
  grupo: GrupoGaleria;
  /** Ocupa el ancho completo de la rejilla (solo la única toma apaisada). */
  ancha: boolean;
  /** Escalera de anchuras, acotada a la resolución real: nunca hay upscaling. */
  widths: number[];
  sizes: string;
}

// Huecos reales de la rejilla (contenedor max-w-6xl con px-5/px-8 y gap-6).
//   1 columna  < 640px · 2 columnas 640–1024px · 3 columnas ≥ 1024px
const SIZES_CELDA =
  '(min-width: 1216px) 347px, (min-width: 1024px) calc((100vw - 7rem) / 3), (min-width: 640px) calc((100vw - 5.5rem) / 2), calc(100vw - 2.5rem)';
const SIZES_BANDA =
  '(min-width: 1216px) 1088px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)';

/**
 * Escalera de anchuras según la resolución del original y el tamaño al que se
 * presenta. Se recorta al ancho real del máster, de modo que Astro nunca amplía
 * una imagen por encima de su resolución. El techo de la celda (1440) cubre una
 * pantalla de 3× sobre el hueco más ancho de la rejilla; para ver la fotografía
 * a resolución completa está el enlace a la versión grande.
 */
function escalera(src: ImageMetadata, ancha: boolean): number[] {
  const ladder = ancha
    ? [640, 960, 1280, 1600, 2176]
    : src.width >= 2160
      ? [480, 720, 1080, 1440]
      : [450, 675, 900];
  return ladder.filter((w) => w <= src.width);
}

function galeria(
  id: string,
  src: ImageMetadata,
  alt: string,
  grupo: GrupoGaleria,
  ancha = false
): FotoGaleria {
  return {
    id,
    src,
    // En galería se muestra el propio máster: `src` y `completa` son el mismo
    // asset y Astro lo emite una sola vez.
    completa: src,
    alt,
    placement: 'galeria',
    grupo,
    ancha,
    widths: escalera(src, ancha),
    sizes: ancha ? SIZES_BANDA : SIZES_CELDA,
  };
}

/** Las cinco piezas que anclan las secciones editoriales. */
export const fotos = {
  /** Hero. Candidata LCP: es la única imagen con carga prioritaria. */
  boxesContraluz: {
    id: 'P027',
    src: boxesContraluz,
    completa: boxesContraluzCompleta,
    alt: 'Fila de boxes individuales cubiertos con velas de sombra, a contraluz al final de la tarde.',
    placement: 'hero',
  },

  /** Hospedaje. */
  boxesDetalle: {
    id: 'P025',
    src: boxesDetalle,
    completa: boxesDetalleCompleta,
    alt: 'Dos boxes individuales contiguos, uno con la puerta abierta; dentro, una jardinera y una bombilla colgada.',
    caption: 'Cerramiento, drenaje y sombra.',
    placement: 'hospedaje',
  },

  /** Banda de entorno, entre confianza y proceso de reserva. */
  vistaAereaMula: {
    id: 'P022',
    src: vistaAereaMula,
    completa: vistaAereaCompleta,
    alt: 'Vista aérea al atardecer del recinto vallado, con módulos y velas de sombra, rodeado de campos de cultivo y montañas.',
    caption: 'Ctra. de Pliego, Mula. La huerta y la sierra al fondo.',
    placement: 'entorno',
  },

  /** Galería, apertura del bloque. */
  casetaExterior: {
    id: 'P010',
    src: casetaExterior,
    completa: casetaExteriorCompleta,
    alt: 'Caseta de madera pintada de blanco sobre césped, junto a la valla de cañizo.',
    caption: 'Una de las zonas exteriores.',
    placement: 'galeria',
  },

  /** Galería, cierre del bloque. */
  portonMural: {
    id: 'P015',
    src: portonMural,
    completa: portonMuralCompleta,
    alt: 'Portón metálico blanco con un mural pintado a mano: dos perros, un castillo y el rótulo Hotel Canino Río Mula.',
    caption: 'La entrada.',
    placement: 'galeria',
  },
} as const satisfies Record<string, Foto>;

/**
 * Las 23 fotografías restantes, en orden documental. Se agrupan en dos bloques
 * factuales: los perros fotografiados en el recinto y las tomas del acto de
 * apertura. Ninguna se repite: las cinco de arriba no vuelven a aparecer aquí.
 */
export const galeriaCompleta: FotoGaleria[] = [
  galeria(
    'P004',
    perroPiscina,
    'Un perro de pelaje jaspeado en gris, blanco y negro, con un ojo azul y otro marrón, sentado dentro de una piscina plegable azul con agua.',
    'perros'
  ),
  galeria(
    'P026',
    perroPiscinaJuguete,
    'Un perro de pelaje jaspeado en gris, blanco y negro dentro de una piscina plegable azul, sujetando con la boca un juguete verde y rojo; detrás, una valla de cañizo con guirnalda de bombillas.',
    'perros'
  ),
  galeria(
    'P008',
    dosPerros,
    'Dos perros pequeños se acercan hocico con hocico sobre la grava: uno de pelo largo y blanco, el otro de pelo corto, color leonado y hocico chato, sujeto con correa. Detrás, las piernas de varias personas.',
    'perros'
  ),
  galeria(
    'P018',
    perroBlancoArnes,
    'Un perro pequeño de pelo largo y blanco, con arnés de cuadros amarillos y correa, de pie sobre la grava y con la boca abierta; al fondo, personas desenfocadas.',
    'perros'
  ),
  galeria(
    'P021',
    perroMarronArnes,
    'Un perro de pelo corto y color marrón oscuro, de cuerpo alargado, con arnés verde claro y correa, de pie sobre la grava; al fondo, personas y árboles a contraluz.',
    'perros'
  ),

  galeria(
    'P001',
    grupoRamos,
    'Grupo de nueve personas posando en fila ante una valla de ocultación marrón con pilares de ladrillo; cuatro sostienen ramos de flores. Suelo de grava.',
    'apertura',
    true
  ),
  galeria(
    'P011',
    vistaAereaLogotipo,
    'Vista aérea del recinto al atardecer, con el logotipo de Hotel Canino Río Mula superpuesto en blanco sobre el centro de la imagen.',
    'apertura'
  ),
  galeria(
    'P024',
    posadoPorton,
    'Dos personas con chaleco beis y un niño posan junto a un portón blanco; una de ellas extiende la mano hacia el lateral. Suelo empedrado y verja de forja al fondo.',
    'apertura'
  ),
  galeria(
    'P002',
    retratoVallaVerde,
    'Una persona con gafas, camiseta blanca serigrafiada y chaleco beis de bolsillos, apoyada en una valla metálica verde al atardecer; detrás, otras personas desenfocadas.',
    'apertura'
  ),
  // P003 es un duplicado byte a byte de P002: conserva ficha, alt y enlace
  // propios, pero reutiliza el mismo máster en vez de guardar una segunda copia.
  galeria(
    'P003',
    retratoVallaVerde,
    'La escena de la valla metálica verde al atardecer, repetida en una toma de encuadre idéntico a la anterior.',
    'apertura'
  ),
  galeria(
    'P005',
    retratoManoAbierta,
    'Una persona con camiseta blanca y chaleco beis sonríe a cámara con una mano abierta hacia delante; detrás, a contraluz, una valla metálica y gente desenfocada.',
    'apertura'
  ),
  galeria(
    'P019',
    retratoManosJuntas,
    'La misma persona con chaleco beis sonríe a cámara en el mismo lugar, esta vez con las dos manos juntas a la altura de la cintura.',
    'apertura'
  ),
  galeria(
    'P006',
    risaPieMicro,
    'Una persona con chaleco beis ríe apoyando el brazo en un pie de micrófono, junto a una mesa con equipo de sonido; al fondo, la valla de ocultación marrón.',
    'apertura'
  ),
  galeria(
    'P007',
    microMesaSonido,
    'Una persona con chaleco beis habla por un micrófono de mano mientras otra atiende la mesa de sonido justo detrás.',
    'apertura'
  ),
  galeria(
    'P013',
    microPlanoCorto,
    'Plano corto de una persona con chaleco beis que sonríe mientras habla por un micrófono de mano; al fondo, otra persona junto al equipo de sonido.',
    'apertura'
  ),
  galeria(
    'P014',
    microBotella,
    'Una persona con gafas y chaleco beis habla por un micrófono de mano sosteniendo una botella de agua en la otra mano; detrás, un pilar de ladrillo y la valla de ocultación.',
    'apertura'
  ),
  galeria(
    'P023',
    microPlanoMedio,
    'La misma intervención con micrófono de mano, en plano medio y con el encuadre más centrado sobre la camiseta serigrafiada.',
    'apertura'
  ),
  galeria(
    'P009',
    conversacionCarpa,
    'Varias personas conversan bajo una carpa blanca al atardecer; en primer plano y de espaldas, alguien con un chaleco beis serigrafiado «Canino Río Mula».',
    'apertura'
  ),
  galeria(
    'P017',
    bajoLaCarpaAbierto,
    'La misma escena bajo la carpa en un encuadre más abierto: dos personas conversan sonriendo y se ve el resto del grupo alrededor.',
    'apertura'
  ),
  galeria(
    'P016',
    ramosPlacaTres,
    'Tres personas sonríen tras una entrega: dos sostienen ramos de flores envueltos en papel y una tercera mira una placa enmarcada.',
    'apertura'
  ),
  galeria(
    'P020',
    ramoPlaca,
    'Encuadre cerrado de la misma entrega: una persona sostiene el ramo y sonríe mientras otra, con gafas, mira la placa enmarcada que sujeta con las dos manos.',
    'apertura'
  ),
  galeria(
    'P012',
    publicoAplaudiendo,
    'Un grupo de personas aplaude al aire libre al atardecer, con coches aparcados y árboles al fondo.',
    'apertura'
  ),
  galeria(
    'P028',
    arcoArcoiris,
    'Un arco hinchable con los colores del arcoíris y bases con forma de nube, montado sobre una franja de césped artificial; al fondo, árboles, una valla blanca y personas a contraluz.',
    'apertura'
  ),
];
