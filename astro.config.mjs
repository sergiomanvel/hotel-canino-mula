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

// Hosts de confianza para la comprobación CSRF (checkOrigin) de Astro. Además del
// dominio público (PUBLIC_SITE_URL), en Vercel autorizamos las URLs que la propia
// plataforma genera por deployment, por rama (Preview) y de producción —expuestas
// como variables de entorno en build—. Sin esto, el POST del formulario se rechaza
// en los Previews (host distinto a PUBLIC_SITE_URL) con
// "Cross-site POST form submissions are forbidden".
const allowedDomains = [
  { protocol: SITE.protocol.replace(':', ''), hostname: SITE.hostname },
  ...[
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .filter(Boolean)
    .map((hostname) => ({ protocol: 'https', hostname })),
];

export default defineConfig({
  site: SITE_URL,

  adapter: vercel(),

  // Protección CSRF de Astro (checkOrigin) ACTIVA (valor por defecto). En POST de
  // formularios Astro exige que la cabecera `Origin` del navegador coincida con el
  // origin reconstruido; detrás del proxy de Vercel solo confía en
  // `X-Forwarded-Host`/`X-Forwarded-Proto` si el host está en `allowedDomains`
  // (si no, cae a `localhost` y rechaza el POST).
  security: { allowedDomains },

  vite: {
    plugins: [tailwindcss()],
  },

  // Excluimos del sitemap el área privada /admin (además va noindex) y la
  // página de confirmación /reserva-recibida (noindex; sin valor de búsqueda).
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') && !page.includes('/reserva-recibida'),
    }),
  ],
});