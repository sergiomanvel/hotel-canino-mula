// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// URL del sitio (sitemaps, Open Graph y URLs canónicas). Se toma de la variable
// de entorno PUBLIC_SITE_URL para poder desplegar en un dominio provisional
// (.vercel.app) sin tocar código. Si no está definida, usa el dominio definitivo
// como fallback.
//   - Provisional: en Vercel define PUBLIC_SITE_URL=https://NOMBRE.vercel.app
//   - Definitivo:  cambia PUBLIC_SITE_URL al dominio real cuando exista.
//
// Modelo de renderizado (Astro 5 híbrido):
//   - Las páginas se prerenderizan a estático por defecto (landing rápida).
//   - Solo las rutas con `export const prerender = false` se ejecutan
//     on-demand en Vercel (p. ej. el endpoint /api/reservas).
const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://hotelcaninoriomula.es';
const SITE = new URL(SITE_URL);

export default defineConfig({
  site: SITE_URL,

  adapter: vercel(),

  // Protección CSRF de Astro (checkOrigin) ACTIVA (valor por defecto). En POST
  // de formularios Astro exige que la cabecera `Origin` del navegador coincida
  // con el origin de la petición. Detrás del proxy de Vercel, Astro solo confía
  // en `X-Forwarded-Host`/`X-Forwarded-Proto` para reconstruir ese origin si el
  // dominio está en `allowedDomains`; si no, cae a `localhost` y el POST se
  // rechaza con "Cross-site POST form submissions are forbidden".
  // Por eso autorizamos el dominio público (el de PUBLIC_SITE_URL).
  security: {
    allowedDomains: [
      {
        protocol: SITE.protocol.replace(':', ''),
        hostname: SITE.hostname,
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },

  // Excluimos el área privada /admin del sitemap público (además va noindex).
  integrations: [sitemap({ filter: (page) => !page.includes('/admin') })],
});