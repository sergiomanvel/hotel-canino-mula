// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// IMPORTANTE (propietario): cuando tengas el dominio definitivo,
// actualiza `site` para sitemaps, Open Graph y URLs canónicas.
//
// Modelo de renderizado (Astro 5 híbrido):
//   - Las páginas se prerenderizan a estático por defecto (landing rápida).
//   - Solo las rutas con `export const prerender = false` se ejecutan
//     on-demand en Vercel (p. ej. el endpoint /api/reservas).
export default defineConfig({
  site: 'https://hotelcaninoriomula.es',

  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});