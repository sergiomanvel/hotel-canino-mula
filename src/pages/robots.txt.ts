import type { APIRoute } from 'astro';

// robots.txt dinámico (se prerenderiza a estático en el build).
//
// La línea `Sitemap:` usa la URL del sitio configurada en astro.config.mjs
// (que a su vez viene de PUBLIC_SITE_URL). Así robots y sitemap apuntan siempre
// al mismo dominio que canonical/Open Graph, también en el dominio provisional
// .vercel.app. Sin PUBLIC_SITE_URL, cae al dominio definitivo como fallback.
export const prerender = true;

const FALLBACK_SITE = 'https://hotelcaninoriomula.es';

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() ?? FALLBACK_SITE).replace(/\/$/, '');
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
