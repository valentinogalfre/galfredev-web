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
