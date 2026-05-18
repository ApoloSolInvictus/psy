-- PSY MVP schema for Supabase.
-- Run in Supabase SQL Editor after creating the project.
-- Security notes:
-- - RLS is enabled on every public table.
-- - Grants are explicit because new Supabase projects may not expose public tables automatically.
-- - Sensitive user data is only available to the owning authenticated user.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'premium', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  system_prompt text not null,
  image_url text,
  active boolean not null default true
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid not null references public.ai_characters(id),
  title text not null default 'Nueva conversación',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  safety_flag text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists public.mood_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood integer not null check (mood between 1 and 10),
  anxiety integer not null check (anxiety between 1 and 10),
  sleep_quality integer not null check (sleep_quality between 1 and 10),
  energy integer not null check (energy between 1 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  instructions text not null,
  active boolean not null default true
);

create table if not exists public.user_exercise_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  completed_at timestamptz not null default now(),
  notes text
);

create table if not exists public.crisis_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  warning_signs text[] not null default '{}',
  coping_steps text[] not null default '{}',
  trusted_contacts text[] not null default '{}',
  emergency_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  paypal_subscription_id text unique,
  status text not null default 'inactive',
  plan text not null default 'free',
  current_period_end timestamptz
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists conversations_user_updated_idx on public.conversations(user_id, updated_at desc);
create index if not exists conversations_character_id_idx on public.conversations(character_id);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists mood_checkins_user_created_idx on public.mood_checkins(user_id, created_at desc);
create index if not exists exercise_logs_user_completed_idx on public.user_exercise_logs(user_id, completed_at desc);
create index if not exists exercise_logs_exercise_id_idx on public.user_exercise_logs(exercise_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists ai_characters_active_name_idx on public.ai_characters(name) where active = true;
create index if not exists exercises_active_duration_idx on public.exercises(duration_minutes) where active = true;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    'free'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.ai_characters enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.mood_checkins enable row level security;
alter table public.exercises enable row level security;
alter table public.user_exercise_logs enable row level security;
alter table public.crisis_plans enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "active_characters_readable" on public.ai_characters;
create policy "active_characters_readable"
  on public.ai_characters for select to anon, authenticated
  using (active = true);

drop policy if exists "conversations_owner_all" on public.conversations;
create policy "conversations_owner_all"
  on public.conversations for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "messages_owner_select" on public.messages;
create policy "messages_owner_select"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

drop policy if exists "messages_owner_insert" on public.messages;
create policy "messages_owner_insert"
  on public.messages for insert to authenticated
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = (select auth.uid())
    )
  );

drop policy if exists "mood_checkins_owner_all" on public.mood_checkins;
create policy "mood_checkins_owner_all"
  on public.mood_checkins for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "active_exercises_readable" on public.exercises;
create policy "active_exercises_readable"
  on public.exercises for select to anon, authenticated
  using (active = true);

drop policy if exists "exercise_logs_owner_all" on public.user_exercise_logs;
create policy "exercise_logs_owner_all"
  on public.user_exercise_logs for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "crisis_plans_owner_all" on public.crisis_plans;
create policy "crisis_plans_owner_all"
  on public.crisis_plans for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "subscriptions_owner_select" on public.subscriptions;
create policy "subscriptions_owner_select"
  on public.subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;

grant select on table public.ai_characters to anon, authenticated;
grant select on table public.exercises to anon, authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.conversations to authenticated;
grant select, insert on table public.messages to authenticated;
grant select, insert, update, delete on table public.mood_checkins to authenticated;
grant select, insert, update, delete on table public.user_exercise_logs to authenticated;
grant select, insert, update on table public.crisis_plans to authenticated;
grant select on table public.subscriptions to authenticated;

grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

insert into public.ai_characters (id, name, description, system_prompt, image_url, active)
values
  ('11111111-1111-4111-8111-111111111111', 'Sofía', 'Cálida, sabia y maternal; escucha con profundidad.', 'Adopta una presencia cálida, paciente y protectora. Refleja emociones con suavidad, valida sin exagerar y ayuda al usuario a encontrar un pequeño paso de cuidado.', null, true),
  ('22222222-2222-4222-8222-222222222222', 'Maximus', 'Lógico y estructurado; ordena pensamientos y planes.', 'Adopta un estilo lógico, claro y estructurado. Ayuda a separar hechos, pensamientos, emociones y próximos pasos sin sonar frío.', null, true),
  ('33333333-3333-4333-8333-333333333333', 'Anima', 'Espiritual suave; respiración, meditación y calma.', 'Adopta un estilo sereno y contemplativo. Propón respiración, presencia corporal y ejercicios breves de calma sin imponer creencias.', null, true),
  ('44444444-4444-4444-8444-444444444444', 'Pax', 'Pacificador; ayuda en conflictos familiares o de pareja.', 'Adopta una postura conciliadora y respetuosa. Ayuda a identificar necesidades, límites sanos y formas no violentas de comunicar.', null, true),
  ('55555555-5555-4555-8555-555555555555', 'Cor', 'Amigable y emocional; acompaña tristeza y soledad.', 'Adopta un tono cercano y amistoso. Acompaña la tristeza y soledad con ternura, sin minimizar ni prometer curas.', null, true),
  ('66666666-6666-4666-8666-666666666666', 'Mentor Estoico', 'Práctico; disciplina, hábitos y autocontrol.', 'Adopta un estilo práctico, sobrio y orientado a hábitos. Distingue lo controlable de lo no controlable y sugiere acciones concretas.', null, true),
  ('77777777-7777-4777-8777-777777777777', 'Artista Interior', 'Creatividad, música, dibujo, escritura y distracción sana.', 'Adopta un estilo creativo y sensible. Propón escritura, dibujo, música y pequeñas actividades expresivas para regular emociones.', null, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  system_prompt = excluded.system_prompt,
  image_url = excluded.image_url,
  active = excluded.active;

insert into public.exercises (id, title, category, duration_minutes, instructions, active)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Respiración 4-6', 'respiración', 3, 'Inhala por 4 segundos, exhala por 6 segundos. Repite durante 3 minutos y observa cómo cambia tu cuerpo.', true),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Journaling de descarga', 'journaling', 8, 'Escribe sin editar: qué siento, qué necesito, qué paso pequeño puedo dar hoy.', true),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Tres gratitudes reales', 'gratitud', 5, 'Anota tres cosas concretas que agradeces hoy, aunque sean pequeñas o imperfectas.', true),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Caminar sin pantalla', 'movimiento', 10, 'Da una caminata breve sin revisar el teléfono. Mira colores, sonidos y temperatura.', true),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Ordenar un metro', 'entorno', 7, 'Elige una superficie pequeña y ordénala. No busques perfección, solo un poco más de claridad.', true),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'Llamar a alguien', 'conexión', 10, 'Contacta a una persona segura. Puedes decir: "No necesito soluciones, solo compañía un momento".', true),
  ('12121212-1212-4212-8212-121212121212', 'Meditación breve', 'calma', 5, 'Siéntate cómodo, nota tu respiración y vuelve con amabilidad cada vez que la mente se vaya.', true)
on conflict (id) do update set
  title = excluded.title,
  category = excluded.category,
  duration_minutes = excluded.duration_minutes,
  instructions = excluded.instructions,
  active = excluded.active;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner = (select auth.uid()))
  with check (bucket_id = 'avatars' and owner = (select auth.uid()));
