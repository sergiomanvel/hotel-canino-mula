# Hotel Canino Río Mula — Web

Landing page para **Hotel Canino Río Mula** (Mula, Región de Murcia). Hecha con
**Astro + TypeScript + Tailwind CSS v4**. Orientada a conseguir contactos por
WhatsApp. Sin backend, sin base de datos, sin CMS.

## Requisitos

- Node.js 18.20+ / 20+ / 22+ (probado con Node 22)

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor local en http://localhost:4321
npm run build    # build de producción en /dist
npm run preview  # previsualizar el build
```

## Estructura

```
src/
  components/      # Header, Hero, Services, FAQ, Footer, botón flotante, etc.
  data/            # site.ts (contacto/SEO), services.ts, faq.ts  ← edita aquí
  layouts/         # BaseLayout.astro (SEO + JSON-LD)
  pages/           # index.astro
  styles/          # global.css (tema y tokens de Tailwind v4)
public/
  images/placeholders/   # coloca aquí las fotos reales
  favicon.svg, og-image.svg, robots.txt
```

## Cómo editar el contenido

- **Contacto, WhatsApp, redes y SEO:** `src/data/site.ts`
- **Servicios:** `src/data/services.ts`
- **Preguntas frecuentes:** `src/data/faq.ts`
- **Dominio:** `astro.config.mjs` (`site`) y `public/robots.txt`

El enlace de WhatsApp está centralizado en `src/data/site.ts` (`WHATSAPP_LINK`).

## Pendiente de confirmar por el propietario

Busca los comentarios `PROPIETARIO:` en el código. Datos NO incluidos (no se
inventan): dirección exacta, horarios, precios, fecha de apertura, nº de plazas,
licencias, personal veterinario, cámaras e instalaciones concretas. Sustituye
también los bloques visuales por fotos reales en `public/images/`.

## Despliegue

Compatible con **Vercel**, **Netlify** o similar (salida estática):

- Build command: `npm run build`
- Output directory: `dist`
