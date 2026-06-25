-- =====================================================================
--  Hotel Canino Río Mula — Fase 2B-2
--  Migración 0002: tabla de administradores + RLS endurecida
-- =====================================================================
-- Cómo aplicar:
--   Supabase Studio → SQL Editor → pega este archivo → Run.
--
-- DESPUÉS de ejecutar esta migración (paso manual obligatorio):
--   1. Obtén el user_id del propietario en Authentication → Users
--      (columna UID; es un UUID, no es un secreto).
--   2. Insértalo en public.admins, p. ej.:
--        insert into public.admins (user_id) values ('<OWNER_UID>');
--      Sin esta fila, /admin NO mostrará reservas (RLS lo bloquea).
--   3. Mantén los sign-ups públicos DESACTIVADOS (Authentication → Settings).
-- =====================================================================

-- Tabla de administradores: solo estos usuarios pueden gestionar reservas.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Helper: ¿el usuario autenticado actual es administrador?
-- SECURITY DEFINER + search_path fijado: puede consultar public.admins de forma
-- segura sin depender de los privilegios/RLS del rol que llama, y evita recursión.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.user_id = auth.uid()
  );
$$;

-- Privilegios de tabla para el rol de usuarios logueados.
-- (Sin GRANT, PostgREST daría "permission denied for table".)
grant select, update on table public.reservations to authenticated;
grant select on table public.admins to authenticated;

-- Reemplazar las políticas previas de reservations por políticas basadas en is_admin().
drop policy if exists "reservations_select_authenticated" on public.reservations;
drop policy if exists "reservations_update_authenticated" on public.reservations;
drop policy if exists "admin_select" on public.reservations;
drop policy if exists "admin_update" on public.reservations;

create policy "reservations_admin_select" on public.reservations
  for select
  to authenticated
  using (public.is_admin());

create policy "reservations_admin_update" on public.reservations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- NOTA: NO se concede nada al rol `anon`. Los inserts públicos siguen entrando
-- únicamente por el endpoint /api/reservas con service_role (que se salta RLS).

-- RLS en la propia tabla admins: cada admin solo puede ver su propia fila.
-- (is_admin() sigue funcionando porque es SECURITY DEFINER.)
alter table public.admins enable row level security;
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select
  to authenticated
  using (user_id = auth.uid());
