// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// IMPORTANTE (propietario): cuando tengas el dominio definitivo,
// actualiza `site` para sitemaps, Open Graph y URLs canónicas.
export default defineConfig({
  site: 'https://hotelcaninoriomula.es',
  vite: {
    plugins: [tailwindcss()],
  },
});
