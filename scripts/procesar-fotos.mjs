/**
 * Copia los originales de `media-source/photos` a `src/assets/fotos/completas/`
 * como másteres completos, sin tocar un solo byte.
 *
 * Uso:  node scripts/procesar-fotos.mjs [--check]
 *       --check  no escribe nada; solo verifica originales y correspondencias.
 *
 * Por qué no se reencoda
 * ----------------------
 * Reencodar con sharp añadiría una generación de pérdidas sin ganar nada, así
 * que los datos comprimidos del JPEG (la exploración entrópica) se copian tal
 * cual. El máster tiene exactamente los mismos píxeles que el original.
 *
 * Por qué tampoco es una copia byte a byte
 * ----------------------------------------
 * Los originales de este lote NO llegan limpios del todo: cada uno arrastra un
 * `APP1 Exif` con la fecha y hora de captura y un `APP13 Photoshop/IPTC` con esa
 * misma fecha y un identificador de documento. No hay GPS, ni marca, ni modelo,
 * ni XMP, ni perfil ICC. Copiarlos con `fs.copyFile` publicaría la fecha del
 * reportaje incrustada en los 27 archivos.
 *
 * Solución: se eliminan los segmentos de metadatos (APP1–APP15 y COM) y se
 * conserva todo lo demás —incluidos APP0/JFIF, tablas de cuantización, Huffman y
 * los datos de imagen— sin recomprimir. Es una operación a nivel de marcadores
 * JPEG: no se decodifica ni se vuelve a codificar la imagen.
 *
 * sharp se usa solo para VERIFICAR, nunca para escribir el máster. Si un archivo
 * falla una comprobación estructural (formato, dimensiones, orientación
 * pendiente o GPS) se omite ese archivo y se explica el motivo: no se recomprime
 * automáticamente para «arreglarlo».
 *
 * Qué NO hace: no redimensiona, no recorta, no cambia croma ni calidad, no
 * altera el contenido y no aplica IA.
 *
 * Correspondencia P001–P028
 * -------------------------
 * Los originales tienen nombres UUID sin significado. El identificador Pnnn se
 * deriva de la posición del archivo al ordenar el directorio por nombre, así que
 * este script no necesita —ni contiene— ningún nombre de archivo original.
 * `media-source/` está fuera de Git y sus nombres nunca se publican.
 *
 * Los recortes editoriales de Hero, Hospedaje, Entorno y la cabecera de Galería
 * viven en `src/assets/fotos/` y este script no los toca. Las cinco fotografías
 * recortadas tienen además aquí su máster completo, para el enlace de tamaño
 * grande.
 *
 * Dependencias: `sharp`, ya presente en node_modules como parte de la cadena de
 * imágenes de Astro. No se añade nada a package.json.
 */
import { readdir, readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGINALES = path.join(ROOT, 'media-source', 'photos');
const DESTINO = path.join(ROOT, 'src', 'assets', 'fotos', 'completas');

/** Total esperado. Si no cuadra, el script aborta en vez de publicar de menos. */
const TOTAL_ESPERADO = 28;

/**
 * Duplicados exactos del reportaje: mismo contenido byte a byte. Se copia un
 * único máster y las fichas duplicadas de `src/data/fotos.ts` lo comparten,
 * cada una con su propio `alt` y su propio enlace.
 */
const DUPLICADOS_EXACTOS = { P003: 'P002' };

/**
 * Pnnn → nombre del máster completo y dimensiones esperadas. Los nombres
 * describen lo que se ve; no atribuyen identidad, cargo ni raza. El sufijo
 * «-completa» distingue el máster íntegro del recorte editorial que ya existe
 * en `src/assets/fotos/` con el mismo nombre base.
 */
const MASTERES = {
  P001: { slug: 'grupo-ramos-valla', w: 3840, h: 2160 },
  P002: { slug: 'retrato-valla-verde', w: 2160, h: 3840 },
  P004: { slug: 'perro-piscina-plegable', w: 900, h: 1600 },
  P005: { slug: 'retrato-chaleco-mano-abierta', w: 2160, h: 3840 },
  P006: { slug: 'risa-junto-al-pie-de-micro', w: 2160, h: 3840 },
  P007: { slug: 'micro-y-mesa-de-sonido', w: 2160, h: 3840 },
  P008: { slug: 'dos-perros-hocico-con-hocico', w: 2160, h: 3840 },
  P009: { slug: 'conversacion-bajo-la-carpa', w: 2160, h: 3840 },
  P010: { slug: 'caseta-exterior-completa', w: 900, h: 1600 },
  P011: { slug: 'vista-aerea-con-logotipo', w: 900, h: 1600 },
  P012: { slug: 'publico-aplaudiendo', w: 900, h: 1600 },
  P013: { slug: 'micro-plano-corto', w: 2160, h: 3840 },
  P014: { slug: 'micro-y-botella-de-agua', w: 2160, h: 3840 },
  P015: { slug: 'porton-mural-completa', w: 2160, h: 3840 },
  P016: { slug: 'ramos-y-placa-tres-personas', w: 900, h: 1600 },
  P017: { slug: 'bajo-la-carpa-plano-abierto', w: 900, h: 1600 },
  P018: { slug: 'perro-blanco-arnes-de-cuadros', w: 2160, h: 3840 },
  P019: { slug: 'retrato-chaleco-manos-juntas', w: 2160, h: 3840 },
  P020: { slug: 'ramo-y-placa', w: 900, h: 1600 },
  P021: { slug: 'perro-marron-arnes-verde', w: 900, h: 1600 },
  P022: { slug: 'vista-aerea-completa', w: 2160, h: 3840 },
  P023: { slug: 'micro-plano-medio', w: 2160, h: 3840 },
  P024: { slug: 'posado-junto-al-porton', w: 2160, h: 3840 },
  P025: { slug: 'boxes-detalle-completa', w: 2160, h: 3840 },
  P026: { slug: 'perro-piscina-con-juguete', w: 2160, h: 3840 },
  P027: { slug: 'boxes-contraluz-completa', w: 2160, h: 3840 },
  P028: { slug: 'arco-de-arcoiris', w: 2160, h: 3840 },
};

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/** ¿El bloque EXIF (TIFF) declara un IFD de GPS (etiqueta 0x8825)? */
function tieneGps(exif) {
  if (!exif || exif.length < 14) return false;
  const t = exif.subarray(6); // tras "Exif\0\0"
  const le = t[0] === 0x49;
  const u16 = (o) => (le ? t.readUInt16LE(o) : t.readUInt16BE(o));
  const u32 = (o) => (le ? t.readUInt32LE(o) : t.readUInt32BE(o));
  try {
    const ifd0 = u32(4);
    const n = u16(ifd0);
    for (let i = 0; i < n; i++) if (u16(ifd0 + 2 + i * 12) === 0x8825) return true;
    return false;
  } catch {
    return true; // ilegible ⇒ se trata como sospechoso y se omite
  }
}

/**
 * Comprobaciones estructurales. Solo recogen problemas que NO se arreglan
 * quitando marcadores: si alguna falla, el archivo se omite y se revisa a mano.
 * La presencia de EXIF/IPTC no está aquí a propósito: se resuelve más abajo
 * eliminando los segmentos, sin recomprimir.
 */
function revisar(md, esperado) {
  const fallos = [];
  if (md.format !== 'jpeg') fallos.push(`formato ${md.format}, se esperaba jpeg`);
  if (md.width !== esperado.w || md.height !== esperado.h)
    fallos.push(`dimensiones ${md.width}x${md.height}, se esperaban ${esperado.w}x${esperado.h}`);
  // sharp solo expone `orientation` cuando el EXIF trae la etiqueta; 1 es
  // «sin rotación pendiente». Cualquier otro valor exigiría rotar antes.
  if (md.orientation !== undefined && md.orientation !== 1)
    fallos.push(`orientación EXIF ${md.orientation}, requiere rotación`);
  if (tieneGps(md.exif)) fallos.push('contiene coordenadas GPS');
  return fallos;
}

/**
 * Devuelve el mismo JPEG sin segmentos de metadatos: se descartan APP1–APP15
 * (Exif, XMP, ICC, Photoshop/IPTC) y los comentarios COM. Se conservan APP0
 * (JFIF), las tablas y, desde SOS, todos los datos de imagen sin tocar.
 *
 * No decodifica: recorre marcadores y concatena. Cero pérdidas.
 */
function sinMetadatos(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('no empieza por SOI');
  const trozos = [buf.subarray(0, 2)];
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) throw new Error(`marcador inesperado en ${i}`);
    const marcador = buf[i + 1];
    if (marcador === 0xda) {
      trozos.push(buf.subarray(i)); // SOS y datos comprimidos, íntegros
      break;
    }
    const len = buf.readUInt16BE(i + 2);
    const desechable = (marcador >= 0xe1 && marcador <= 0xef) || marcador === 0xfe;
    if (!desechable) trozos.push(buf.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  return Buffer.concat(trozos);
}

const soloComprobar = process.argv.includes('--check');

const archivos = (await readdir(ORIGINALES))
  .filter((f) => /\.(jpe?g|png|tiff?|webp)$/i.test(f))
  .sort();

if (archivos.length !== TOTAL_ESPERADO) {
  console.error(
    `Se esperaban ${TOTAL_ESPERADO} fotografías en media-source/photos y hay ${archivos.length}. No se procesa nada.`
  );
  process.exit(1);
}

/** Pnnn → ruta absoluta del original. */
const porId = new Map(
  archivos.map((nombre, i) => [`P${String(i + 1).padStart(3, '0')}`, path.join(ORIGINALES, nombre)])
);

const faltan = Object.keys(MASTERES).filter((id) => !porId.has(id));
if (faltan.length) {
  console.error(`Identificadores sin original: ${faltan.join(', ')}. No se procesa nada.`);
  process.exit(1);
}

// Ninguna fotografía puede quedarse fuera: másteres + duplicados = 28.
const cubiertas = new Set([...Object.keys(MASTERES), ...Object.keys(DUPLICADOS_EXACTOS)]);
const huerfanas = [...porId.keys()].filter((id) => !cubiertas.has(id));
if (huerfanas.length) {
  console.error(`Fotografías sin destino en la web: ${huerfanas.join(', ')}. No se procesa nada.`);
  process.exit(1);
}

if (soloComprobar) {
  console.log(
    `OK: ${archivos.length} originales · ${Object.keys(MASTERES).length} másteres completos · ` +
      `${Object.keys(DUPLICADOS_EXACTOS).length} duplicado(s) compartido(s).`
  );
  process.exit(0);
}

await mkdir(DESTINO, { recursive: true });

const copiados = [];
const omitidos = [];

for (const [id, esperado] of Object.entries(MASTERES)) {
  const origen = porId.get(id);
  const entrada = await readFile(origen);
  const md = await sharp(entrada).metadata();

  const fallos = revisar(md, esperado);
  if (fallos.length) {
    omitidos.push({ id, slug: esperado.slug, fallos });
    console.log(`${id}  OMITIDO  ${esperado.slug}.jpg — ${fallos.join('; ')}`);
    continue;
  }

  const destino = path.join(DESTINO, `${esperado.slug}.jpg`);
  const salida = sinMetadatos(entrada);
  await writeFile(destino, salida);

  // El máster solo es válido si conserva exactamente los mismos píxeles y ya no
  // arrastra metadatos. Se comparan los búferes de píxeles en crudo, no el
  // archivo: el contenedor cambia (menos bytes), la imagen no.
  const mdFinal = await sharp(destino).metadata();
  const pxOrigen = sha256(await sharp(entrada).raw().toBuffer());
  const pxDestino = sha256(await sharp(destino).raw().toBuffer());
  const restos = ['exif', 'xmp', 'iptc', 'icc'].filter((k) => mdFinal[k]);

  if (pxOrigen !== pxDestino) {
    console.error(`${id}  ERROR: los píxeles de ${esperado.slug}.jpg no coinciden con el original.`);
    process.exit(1);
  }
  if (restos.length) {
    console.error(`${id}  ERROR: ${esperado.slug}.jpg conserva ${restos.join(', ')}.`);
    process.exit(1);
  }
  if (mdFinal.width !== md.width || mdFinal.height !== md.height) {
    console.error(`${id}  ERROR: ${esperado.slug}.jpg cambió de dimensiones.`);
    process.exit(1);
  }

  const bytes = (await stat(destino)).size;
  copiados.push({
    id,
    slug: esperado.slug,
    w: md.width,
    h: md.height,
    bytes,
    quitados: entrada.length - bytes,
    px: pxOrigen,
  });
  console.log(
    `${id}  ${(esperado.slug + '.jpg').padEnd(34)} ${String(md.width).padStart(4)}x${String(md.height).padEnd(4)} ` +
      `${String(Math.round(bytes / 1024)).padStart(5)}KB  −${String(entrada.length - bytes).padStart(3)}B metadatos  ` +
      `píxeles idénticos sha256 ${pxOrigen.slice(0, 8)}…`
  );
}

const total = copiados.reduce((a, r) => a + r.bytes, 0);
const quitados = copiados.reduce((a, r) => a + r.quitados, 0);
console.log(
  `\n${copiados.length} másteres completos · ${(total / 1024 / 1024).toFixed(2)} MB · ` +
    `píxeles idénticos al original en ${copiados.length}/${copiados.length} · ` +
    `${quitados} B de metadatos eliminados · 0 recompresiones`
);
console.log(`fichas cubiertas: ${copiados.length} + ${Object.keys(DUPLICADOS_EXACTOS).length} duplicado(s) = 28`);

if (omitidos.length) {
  console.log(`\n${omitidos.length} archivo(s) omitido(s) por no cumplir las comprobaciones:`);
  for (const o of omitidos) console.log(`  ${o.id} ${o.slug}: ${o.fallos.join('; ')}`);
  console.log('Revísalos a mano. No se recomprimen automáticamente.');
  process.exit(1);
}
