-- =====================================================================
--  Hotel Canino Río Mula — Ampliación del formulario de reserva
--  Migración 0003: perfil del perro en las solicitudes de reserva
-- =====================================================================
-- Cómo aplicar:
--   Supabase Studio → SQL Editor → pega este archivo → Run.
--
-- CARACTERÍSTICAS:
--   - Es ADITIVA: solo añade columnas. No hay DROP, no se eliminan ni
--     modifican columnas existentes, no se tocan datos ni RLS ni Auth.
--   - Todas las columnas son NULLABLE, incluso las que el formulario
--     público marca como obligatorias (dog_sex, dog_age,
--     dog_vaccinations_up_to_date). Las reservas históricas no tienen
--     esos datos y deben seguir siendo válidas y legibles en /admin.
--   - Es BACKWARD-COMPATIBLE: puede aplicarse ANTES de desplegar el
--     código nuevo. El código antiguo sigue funcionando porque no
--     escribe en estas columnas.
--   - Es idempotente (`if not exists`): volver a ejecutarla no falla.
--
-- CONVENCIÓN DE VALORES:
--   Se guardan valores técnicos estables en inglés ('male'/'female',
--   'yes'/'no'/'unknown', 'yes'/'no'/'depends') y las etiquetas en
--   español viven en la interfaz. Se usa `text` + CHECK en lugar de
--   enums de PostgreSQL: son 16 columnas y los enums complicarían
--   migraciones futuras (añadir un valor exige ALTER TYPE). El enum
--   existente `reservation_status` se mantiene intacto.
--
--   Los CHECK aceptan NULL por diseño: en SQL, `null in (...)` evalúa a
--   NULL y la restricción no se viola, así que las filas históricas
--   pasan sin necesidad de backfill.
-- =====================================================================

-- ---------------------------------------------------------------------
--  03 · Tu perro — datos básicos
-- ---------------------------------------------------------------------
alter table public.reservations
  add column if not exists dog_sex text
    constraint reservations_dog_sex_check
    check (dog_sex in ('male', 'female'));

alter table public.reservations
  add column if not exists dog_age text;

alter table public.reservations
  add column if not exists dog_neutered text
    constraint reservations_dog_neutered_check
    check (dog_neutered in ('yes', 'no', 'unknown'));

alter table public.reservations
  add column if not exists dog_vaccinations_up_to_date text
    constraint reservations_dog_vaccinations_check
    check (dog_vaccinations_up_to_date in ('yes', 'no', 'unknown'));

-- ---------------------------------------------------------------------
--  04 · Para conocerle mejor — comportamiento
-- ---------------------------------------------------------------------
alter table public.reservations
  add column if not exists dog_social_with_dogs text
    constraint reservations_dog_social_dogs_check
    check (dog_social_with_dogs in ('yes', 'no', 'depends'));

alter table public.reservations
  add column if not exists dog_social_with_people text
    constraint reservations_dog_social_people_check
    check (dog_social_with_people in ('yes', 'no', 'depends'));

alter table public.reservations
  add column if not exists dog_aggression_history text
    constraint reservations_dog_aggression_check
    check (dog_aggression_history in ('yes', 'no'));

alter table public.reservations
  add column if not exists dog_aggression_details text;

alter table public.reservations
  add column if not exists dog_has_fears text
    constraint reservations_dog_fears_check
    check (dog_has_fears in ('yes', 'no'));

alter table public.reservations
  add column if not exists dog_fears_details text;

alter table public.reservations
  add column if not exists dog_escape_attempts text
    constraint reservations_dog_escape_check
    check (dog_escape_attempts in ('yes', 'no'));

alter table public.reservations
  add column if not exists dog_separation_anxiety text
    constraint reservations_dog_separation_check
    check (dog_separation_anxiety in ('yes', 'no', 'unknown'));

-- ---------------------------------------------------------------------
--  04 · Para conocerle mejor — alimentación y cuidados
-- ---------------------------------------------------------------------
alter table public.reservations
  add column if not exists dog_has_allergies_or_intolerances text
    constraint reservations_dog_allergies_check
    check (dog_has_allergies_or_intolerances in ('yes', 'no', 'unknown'));

alter table public.reservations
  add column if not exists dog_allergies_or_intolerances_details text;

alter table public.reservations
  add column if not exists dog_feeding_type text;

alter table public.reservations
  add column if not exists dog_brings_own_food text
    constraint reservations_dog_brings_food_check
    check (dog_brings_own_food in ('yes', 'no', 'unknown'));

-- ---------------------------------------------------------------------
--  Notas
-- ---------------------------------------------------------------------
-- `dog_notes` YA EXISTE desde la migración 0001 y NO se toca: sigue
-- siendo el campo libre de observaciones. Solo cambia su etiqueta en la
-- interfaz ("Observaciones o cuidados especiales"); el nombre técnico y
-- los datos históricos permanecen intactos.
--
-- NO se conceden privilegios nuevos ni se modifican políticas RLS: las
-- columnas nuevas quedan cubiertas por las políticas existentes de
-- `public.reservations` (select/update para administradores; los inserts
-- públicos siguen entrando solo por /api/reservas con service_role).
