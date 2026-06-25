# Hotel Canino Río Mula — Web

Landing page para **Hotel Canino Río Mula** (Mula, Región de Murcia). Hecha con
**Astro + TypeScript + Tailwind CSS v4**. La home y el resto de páginas se
sirven como **estáticas**; las solicitudes de reserva del formulario se guardan
en **Supabase** a través de un endpoint server-side (renderizado on-demand en
**Vercel**). WhatsApp se mantiene como canal de contacto secundario.

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
  components/      # Header, Hero, FAQ, ReservationForm, Footer, etc.
  data/            # site.ts (contacto/SEO), services.ts, faq.ts  ← edita aquí
  layouts/         # BaseLayout.astro (SEO + JSON-LD)
  lib/             # supabaseServer.ts (cliente Supabase de servidor)
  pages/           # index.astro, privacidad.astro, reserva-recibida.astro
    api/           # reservas.ts (endpoint POST, prerender = false)
  styles/          # global.css (tema y tokens de Tailwind v4)
public/
  images/placeholders/   # coloca aquí las fotos reales
  favicon.svg, og-image.png, robots.txt
supabase/
  migrations/      # 0001_create_reservations.sql
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

## Panel de reservas (Fase 2A)

El formulario de reserva envía un `POST` a `/api/reservas`, que valida los datos
en servidor y los guarda en una tabla de **Supabase**. De momento **no** se
envían emails (eso será la Fase 2C con Resend) y **no** hay panel `/admin`
propio (Fase 2B): para ver las reservas se usa **Supabase Studio**.

### 1. Variables de entorno

Copia la plantilla y rellénala con los datos de tu proyecto Supabase
(*Project Settings → API*). **Nunca** se commitea `.env` (ya está en
`.gitignore`); la plantilla `.env.example` sí se versiona.

```bash
cp .env.example .env
```

| Variable | Uso |
| --- | --- |
| `PUBLIC_SUPABASE_URL` | URL del proyecto. Publicable. |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave anónima publicable (para el panel de Fase 2B). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreto de servidor.** Solo en `/api/reservas`. Nunca en cliente ni en git. |

En producción, define estas variables en el panel de **Vercel** (Project →
Settings → Environment Variables).

### 2. Crear el proyecto Supabase y aplicar la migración

1. Crea un proyecto en Supabase en una **región de la UE** (p. ej. Frankfurt)
   por RGPD.
2. Abre **SQL Editor** y ejecuta el contenido de
   `supabase/migrations/0001_create_reservations.sql`
   (crea la tabla `reservations`, el enum de estados, los índices y activa RLS).

### 3. Seguridad de acceso

1. En **Authentication → Settings/Providers**, **desactiva el registro público**
   (*Enable sign-ups*). Solo debe existir la cuenta del propietario.
2. **Crea manualmente** el usuario del propietario (email + contraseña) desde el
   panel de Supabase.
3. Las políticas RLS actuales son provisionales (cualquier usuario autenticado).
   En **Fase 2B** se endurecerán para limitarlas al email/uid del propietario.

### 4. Ver las reservas (panel provisional)

Mientras no exista el panel propio, las reservas se consultan en
**Supabase Studio → Table Editor → `reservations`**.

### Fases siguientes

- **Fase 2B:** panel `/admin` propio (login email + contraseña, listado,
  filtros por estado, detalle, notas internas) y endurecimiento de RLS.
- **Fase 2C:** notificación por email al propietario con **Resend** al recibir
  una reserva.

## Despliegue

Despliegue en **Vercel** (adapter `@astrojs/vercel`, modo híbrido):

- Build command: `npm run build`
- Las páginas normales se sirven estáticas; `/api/reservas` se ejecuta como
  función on-demand.
- Configura las variables de entorno de Supabase en Vercel antes de desplegar.
