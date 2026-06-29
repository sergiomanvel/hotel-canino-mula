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
en servidor y los guarda en una tabla de **Supabase**. **No** se envían
notificaciones automáticas por email: el propietario revisa las solicitudes
desde el panel **`/admin`** (documentado más abajo), entrando de forma
periódica. WhatsApp se mantiene como canal de contacto secundario.

Flujo completo: **el cliente envía la solicitud → Supabase guarda la reserva →
el propietario entra en `/admin` y revisa las reservas**.

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
| `PUBLIC_SUPABASE_ANON_KEY` | Clave anónima publicable. La usa el flujo SSR/Auth del panel `/admin`. |
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

### 4. Ver las reservas

Las reservas se consultan desde el panel **`/admin`** (ver más abajo). De forma
puntual también pueden revisarse directamente en **Supabase Studio → Table
Editor → `reservations`**.

### Panel `/admin` (Fase 2B-1: autenticación)

Área privada protegida por sesión (Supabase Auth, cookies vía `@supabase/ssr`).

- **Acceso:** `/admin/login` (email + contraseña). Sin sesión, cualquier ruta
  `/admin*` redirige al login.
- **Variables:** usa `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`
  (recomendado: **legacy anon JWT**, `eyJ…`). El panel **no** usa la
  `service_role`; el acceso a datos se regirá por RLS según la sesión.
- **Requisitos en Supabase:**
  - **Sign-ups públicos desactivados** (Authentication → Settings).
  - **Crear manualmente** el usuario del propietario (email + contraseña) en
    Authentication → Users.

### Panel `/admin` (Fase 2B-2: gestión de reservas)

`/admin` muestra el listado de reservas (con filtro por estado) y el detalle de
cada una (`/admin/reservas/<id>`), donde se puede cambiar el estado y editar las
notas internas. Todo el acceso a datos va con la **sesión del usuario** (RLS),
nunca con `service_role`.

**Aplicar la migración 0002 (RLS endurecida):**
1. Supabase Studio → **SQL Editor** → ejecuta
   `supabase/migrations/0002_admin_access.sql`
   (crea `public.admins`, la función `public.is_admin()`, los GRANT a
   `authenticated` y sustituye las políticas genéricas por políticas basadas en
   `is_admin()`).
2. **Obtén el `user_id` del propietario:** Authentication → **Users** → copia el
   **UID** del usuario (es un UUID, no un secreto).
3. **Conviértelo en administrador** insertándolo en `public.admins` (SQL Editor):
   ```sql
   insert into public.admins (user_id) values ('<OWNER_UID>');
   ```
4. **Importante:** `/admin` solo muestra reservas si el usuario que ha iniciado
   sesión está en `public.admins`. Sin esa fila, el listado aparecerá vacío
   aunque el login funcione. Mantén los **sign-ups públicos desactivados**.

### Antes de producción

No hay notificaciones automáticas por email: el propietario debe revisar el
panel `/admin` de forma periódica para ver las nuevas solicitudes. Lista de
comprobación antes de publicar:

- [ ] **Borrar las filas de prueba** de la tabla `reservations`.
- [ ] **Configurar las variables de entorno** en Vercel: `PUBLIC_SUPABASE_URL`,
      `PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] **Confirmar el dominio definitivo**: cambia `PUBLIC_SITE_URL` (en Vercel)
      al dominio real. Canonical, Open Graph, sitemap y robots lo toman de ahí.
- [ ] **Aplicar las migraciones** `0001_create_reservations.sql` y
      `0002_admin_access.sql` en Supabase.
- [ ] **Insertar el `user_id` del propietario** en `public.admins`.
- [ ] **Verificar `/admin` en producción** (login y listado de reservas).

## Despliegue

Despliegue en **Vercel** (adapter `@astrojs/vercel`, modo híbrido):

- Build command: `npm run build`
- Las páginas normales se sirven estáticas; `/api/reservas` se ejecuta como
  función on-demand.
- Configura las variables de entorno en Vercel **antes** de desplegar (ver abajo).

### Despliegue provisional en Vercel (dominio temporal)

Mientras no exista dominio propio se publica en el dominio temporal de Vercel
(`https://NOMBRE-DEL-PROYECTO.vercel.app`). La URL del sitio (canonical, Open
Graph, sitemap y robots) se toma de la variable **`PUBLIC_SITE_URL`**, así que
no hace falta tocar código para cambiar de dominio.

**Variables de entorno en Vercel** (Project → Settings → Environment Variables):

| Variable | Valor |
| --- | --- |
| `PUBLIC_SITE_URL` | URL pública del despliegue. Provisional: `https://NOMBRE-DEL-PROYECTO.vercel.app`. |
| `PUBLIC_SUPABASE_URL` | URL del proyecto Supabase. |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave anónima publicable (legacy anon JWT, `eyJ…`). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secreto de servidor.** Solo se usa en `/api/reservas`. |

- Si `PUBLIC_SITE_URL` **no** está definida, el sitio cae al dominio definitivo
  (`https://hotelcaninoriomula.es`) como fallback; por eso, en provisional, es
  **obligatorio** definirla con la URL `.vercel.app` para que el SEO no apunte a
  un dominio que aún no existe.
- Cuando exista el **dominio real**, basta con cambiar `PUBLIC_SITE_URL` a ese
  dominio (y asignarlo en el panel de Vercel si es dominio propio). No se edita
  código.
- **No** se usan variables de Resend ni de email: el propietario revisa las
  reservas desde `/admin`.
