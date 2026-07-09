-- GalfreDev schema v4
-- Ejecutar completo en Supabase SQL Editor.
-- Base enfocada en:
-- 1. autenticación con Supabase Auth
-- 2. perfil liviano
-- 3. preferencias de usuario
-- 4. intake comercial / leads
-- 5. consentimientos separados
-- 6. trazabilidad mínima de eventos
-- 7. crecimiento futuro sin sobrecargar el modelo

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  email text not null unique,
  full_name text,
  phone text,
  company_name text,
  avatar_url text
);

alter table public.profiles
  add column if not exists avatar_url text;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  business_type text,
  business_type_other text,
  team_size text,
  team_size_other text,
  primary_need text,
  primary_need_other text,
  interests text[] not null default '{}',
  interests_other text,
  preferred_contact_channel text,
  preferred_contact_channel_other text
);

alter table public.user_preferences
  add column if not exists business_type_other text,
  add column if not exists team_size_other text,
  add column if not exists primary_need_other text,
  add column if not exists interests_other text,
  add column if not exists preferred_contact_channel_other text;

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create table if not exists public.lead_intake (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  user_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  business_type text,
  primary_need text not null,
  challenge text not null,
  status text not null default 'new',
  priority text not null default 'normal',
  source text not null default 'website-contact-form',
  form_key text not null default 'contact',
  page_path text,
  entry_point text,
  cta_id text,
  next_action text,
  next_action_at timestamptz,
  contacted_at timestamptz,
  last_activity_at timestamptz not null default timezone('utc'::text, now()),
  closed_at timestamptz,
  discarded_reason text,
  constraint lead_intake_status_check
    check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam')),
  constraint lead_intake_priority_check
    check (priority in ('low', 'normal', 'high'))
);

alter table public.lead_intake
  add column if not exists priority text not null default 'normal',
  add column if not exists form_key text not null default 'contact',
  add column if not exists page_path text,
  add column if not exists entry_point text,
  add column if not exists cta_id text,
  add column if not exists next_action text,
  add column if not exists next_action_at timestamptz,
  add column if not exists contacted_at timestamptz,
  add column if not exists last_activity_at timestamptz not null default timezone('utc'::text, now()),
  add column if not exists closed_at timestamptz,
  add column if not exists discarded_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'lead_intake_status_check'
  ) then
    alter table public.lead_intake
      add constraint lead_intake_status_check
      check (status in ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'spam'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'lead_intake_priority_check'
  ) then
    alter table public.lead_intake
      add constraint lead_intake_priority_check
      check (priority in ('low', 'normal', 'high'));
  end if;
end $$;

drop trigger if exists trg_lead_intake_updated_at on public.lead_intake;
create trigger trg_lead_intake_updated_at
before update on public.lead_intake
for each row execute function public.set_updated_at();

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  lead_id uuid not null references public.lead_intake(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  event_source text,
  note text,
  payload jsonb not null default '{}'::jsonb,
  constraint lead_events_type_check
    check (event_type in ('lead_created', 'status_changed', 'consent_recorded', 'follow_up_scheduled', 'note_added'))
);

create index if not exists idx_lead_intake_created_at_desc
  on public.lead_intake (created_at desc);

create index if not exists idx_lead_intake_status_created_at
  on public.lead_intake (status, created_at desc);

create index if not exists idx_lead_intake_source_created_at
  on public.lead_intake (source, created_at desc);

create index if not exists idx_lead_intake_email
  on public.lead_intake (email);

create index if not exists idx_lead_intake_user_id
  on public.lead_intake (user_id);

create index if not exists idx_lead_events_lead_id_created_at
  on public.lead_events (lead_id, created_at desc);

create index if not exists idx_lead_events_event_type_created_at
  on public.lead_events (event_type, created_at desc);

create table if not exists public.marketing_consents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  user_id uuid unique references public.profiles(id) on delete cascade,
  lead_id uuid unique references public.lead_intake(id) on delete cascade,
  newsletter_opt_in boolean not null default false,
  commercial_follow_up boolean not null default false,
  profiling_opt_in boolean not null default false,
  privacy_policy_accepted boolean not null default true,
  consented_at timestamptz not null default timezone('utc'::text, now()),
  source text not null default 'website',
  constraint marketing_consents_reference_check
    check (
      (user_id is not null and lead_id is null)
      or (user_id is null and lead_id is not null)
    )
);

drop trigger if exists trg_marketing_consents_updated_at on public.marketing_consents;
create trigger trg_marketing_consents_updated_at
before update on public.marketing_consents
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case
        when excluded.full_name <> '' then excluded.full_name
        else public.profiles.full_name
      end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.lead_intake enable row level security;
alter table public.lead_events enable row level security;
alter table public.marketing_consents enable row level security;

drop policy if exists "Profiles select own" on public.profiles;
drop policy if exists "Profiles insert own" on public.profiles;
drop policy if exists "Profiles update own" on public.profiles;
drop policy if exists "Preferences select own" on public.user_preferences;
drop policy if exists "Preferences upsert own" on public.user_preferences;
drop policy if exists "Lead intake insert public" on public.lead_intake;
drop policy if exists "Lead intake select own" on public.lead_intake;
drop policy if exists "Lead intake update own" on public.lead_intake;
drop policy if exists "Lead events select own" on public.lead_events;
drop policy if exists "Lead events insert own" on public.lead_events;
drop policy if exists "Consents select own" on public.marketing_consents;
drop policy if exists "Consents insert lead public" on public.marketing_consents;
drop policy if exists "Consents upsert own" on public.marketing_consents;

create policy "Profiles select own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Profiles insert own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "Profiles update own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Preferences select own"
  on public.user_preferences
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Preferences upsert own"
  on public.user_preferences
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Lead intake insert public"
  on public.lead_intake
  for insert
  to anon, authenticated
  with check (true);

create policy "Lead intake select own"
  on public.lead_intake
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Lead intake update own"
  on public.lead_intake
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Lead events select own"
  on public.lead_events
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.lead_intake
      where public.lead_intake.id = public.lead_events.lead_id
        and public.lead_intake.user_id = auth.uid()
    )
  );

create policy "Lead events insert own"
  on public.lead_events
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.lead_intake
      where public.lead_intake.id = public.lead_events.lead_id
        and public.lead_intake.user_id = auth.uid()
    )
  );

create policy "Consents select own"
  on public.marketing_consents
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Consents insert lead public"
  on public.marketing_consents
  for insert
  to anon, authenticated
  with check (
    lead_id is not null
    or user_id = auth.uid()
  );

create policy "Consents upsert own"
  on public.marketing_consents
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

comment on table public.lead_intake is
  'Leads u oportunidades comerciales captadas desde formularios, accesos o futuras integraciones.';

comment on table public.lead_events is
  'Trazabilidad mínima de cambios o acciones relevantes sobre un lead.';

comment on column public.lead_intake.source is
  'Origen general del lead, por ejemplo website-contact-form u otra futura integración.';

comment on column public.lead_intake.form_key is
  'Formulario o flujo que originó la captura.';

comment on column public.lead_intake.page_path is
  'Ruta o sección visible desde donde se originó la consulta.';

comment on column public.lead_intake.entry_point is
  'Punto de entrada interno del producto o bloque visual.';

comment on column public.lead_intake.cta_id is
  'CTA o disparador específico usado por el usuario.';

-- Demo bot de la home: contador diario de mensajes por visitante para el
-- rate limit del modo live (Claude). Solo el service role accede (sin policies).
create table if not exists public.demo_bot_usage (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  ip text,
  day date not null default current_date,
  message_count int not null default 0,
  updated_at timestamptz not null default now(),
  unique (visitor_id, day)
);
alter table public.demo_bot_usage enable row level security;

create index if not exists demo_bot_usage_ip_day_idx on public.demo_bot_usage (ip, day);

comment on table public.demo_bot_usage is
  'Contador diario de mensajes por visitante para el rate limit del demo bot en modo live.';

-- Nota:
-- Si luego querés un panel interno de administración total de leads,
-- conviene agregar una tabla de roles internos y políticas específicas
-- antes de exponer lectura global o automatizaciones de backoffice.
