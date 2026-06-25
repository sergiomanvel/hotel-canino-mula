-- =====================================================================
--  Hotel Canino Río Mula — Fase 2A
--  Migración 0001: tabla de solicitudes de reserva
-- =====================================================================
-- Cómo aplicar:
--   Opción A) Supabase Studio → SQL Editor → pega este archivo → Run.
--   Opción B) Supabase CLI → `supabase db push` (si usas migraciones CLI).
--
-- IMPORTANTE (configuración manual en Supabase, fuera de este SQL):
--   1. Crea el proyecto en una REGIÓN DE LA UE (p. ej. Frankfurt) por RGPD.
--   2. Authentication → Providers/Settings: DESACTIVA el registro público
--      ("Enable sign-ups"). Solo debe existir la cuenta del propietario.
--   3. Crea manualmente el usuario del propietario (email + contraseña).
--   4. En Fase 2B se endurecerán las políticas para limitarlas al email/uid
--      concreto del propietario en lugar de a cualquier usuario autenticado.
-- =====================================================================

-- Estados posibles de una solicitud de reserva.
create type public.reservation_status as enum (
  'nueva',
  'contactada',
  'confirmada',
  'rechazada'
);

-- Tabla principal de solicitudes de reserva.
create table public.reservations (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  owner_name          text not null,
  owner_phone         text not null,
  owner_email         text not null,
  dog_name            text not null,
  dog_size_or_breed   text,
  start_date          date,
  end_date            date,
  dog_notes           text,
  accepts_privacy     boolean not null,            -- consentimiento RGPD (obligatorio)
  accepts_photos      boolean not null default false,
  status              public.reservation_status not null default 'nueva',
  internal_notes      text
);

-- Índices para el futuro panel /admin (orden por fecha y filtro por estado).
create index reservations_created_at_idx on public.reservations (created_at desc);
create index reservations_status_idx on public.reservations (status);

-- ---------------------------------------------------------------------
--  Seguridad: Row Level Security
-- ---------------------------------------------------------------------
-- Habilitamos RLS. Por defecto, sin políticas, NADIE (rol anónimo o
-- autenticado a través de las claves de cliente) puede leer ni escribir.
alter table public.reservations enable row level security;

-- NOTA: NO se crea ninguna política para el rol `anon`.
-- => El público NO puede insertar reservas directamente desde el navegador.
--    Las inserciones entran exclusivamente por el endpoint server-side
--    /api/reservas, que usa la clave service_role (omite RLS).

-- Lectura: solo usuarios autenticados (provisional, Fase 2A).
-- Se endurecerá por email/uid del propietario en Fase 2B.
create policy "reservations_select_authenticated"
  on public.reservations
  for select
  to authenticated
  using (true);

-- Actualización: solo usuarios autenticados (provisional, Fase 2A).
-- Necesario para cambiar `status` y `internal_notes` desde el panel.
create policy "reservations_update_authenticated"
  on public.reservations
  for update
  to authenticated
  using (true)
  with check (true);
