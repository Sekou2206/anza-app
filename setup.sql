create table if not exists public.anza_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'attente',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  from_team boolean not null default false,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists messages_user_idx on public.messages(user_id, created_at);

create table if not exists public.team_items (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  title text not null,
  status text not null default 'en_preparation' check (status in ('en_preparation', 'programme', 'publie')),
  created_at timestamptz not null default now()
);

alter table public.anza_state enable row level security;
alter table public.messages enable row level security;
alter table public.team_items enable row level security;

drop policy if exists "state read own" on public.anza_state;
drop policy if exists "state insert own" on public.anza_state;
drop policy if exists "state update own" on public.anza_state;
create policy "state read own" on public.anza_state for select to authenticated using (user_id = auth.uid());
create policy "state insert own" on public.anza_state for insert to authenticated with check (user_id = auth.uid() and plan = 'attente');
create policy "state update own" on public.anza_state for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke update on public.anza_state from authenticated, anon;
grant update (data, updated_at) on public.anza_state to authenticated;
revoke all on public.anza_state from anon;

drop policy if exists "messages read own" on public.messages;
drop policy if exists "messages insert own" on public.messages;
create policy "messages read own" on public.messages for select to authenticated using (user_id = auth.uid());
create policy "messages insert own" on public.messages for insert to authenticated with check (user_id = auth.uid() and from_team = false);
revoke update, delete on public.messages from authenticated, anon;
revoke all on public.messages from anon;

drop policy if exists "team read own" on public.team_items;
create policy "team read own" on public.team_items for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.team_items from authenticated, anon;
revoke all on public.team_items from anon;

create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task text,
  input_tokens integer,
  output_tokens integer,
  ok boolean,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_idx on public.ai_usage(user_id, created_at);
alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;

create table if not exists public.plan_grants (
  email text primary key check (email = lower(email)),
  plan text not null check (plan in ('attente', 'stand', 'boutique', 'magasin')),
  note text,
  created_at timestamptz not null default now()
);
alter table public.plan_grants enable row level security;
revoke all on public.plan_grants from anon, authenticated;

alter table public.anza_state alter column plan set default 'attente';
alter table public.anza_state drop constraint if exists anza_state_plan_check;
alter table public.anza_state add constraint anza_state_plan_check check (plan in ('attente', 'stand', 'boutique', 'magasin'));

create or replace function public.plan_grants_sync()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  new.email := lower(trim(new.email));
  update public.anza_state s set plan = new.plan
  from auth.users u where u.id = s.user_id and lower(u.email) = new.email;
  return new;
end $$;

drop trigger if exists plan_grants_sync on public.plan_grants;
create trigger plan_grants_sync before insert or update on public.plan_grants
for each row execute function public.plan_grants_sync();

create or replace function public.give_plan(client_email text, new_plan text)
returns text language plpgsql security definer set search_path = public as $$
begin
  insert into public.plan_grants (email, plan) values (lower(trim(client_email)), new_plan)
  on conflict (email) do update set plan = excluded.plan;
  return lower(trim(client_email)) || ' : ' || new_plan;
end $$;
revoke all on function public.give_plan(text, text) from public, anon, authenticated;
revoke all on function public.plan_grants_sync() from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.anza_state (user_id, plan)
  values (new.id, coalesce((select g.plan from public.plan_grants g where g.email = lower(new.email)), 'attente'))
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

create or replace view public.clients_overview with (security_invoker = true) as
select s.user_id, u.email, s.plan,
       s.data->'profile'->>'business' as activite,
       s.data->'profile'->>'first' as prenom,
       jsonb_array_length(coalesce(s.data->'clients', '[]'::jsonb)) as nb_contacts,
       s.updated_at as derniere_activite
from public.anza_state s join auth.users u on u.id = s.user_id;
revoke all on public.clients_overview from anon, authenticated;

create or replace view public.ai_usage_month with (security_invoker = true) as
select user_id, date_trunc('month', created_at) as mois, count(*) as appels,
       sum(coalesce(input_tokens, 0)) as tokens_entree, sum(coalesce(output_tokens, 0)) as tokens_sortie
from public.ai_usage group by 1, 2;
revoke all on public.ai_usage_month from anon, authenticated;

create table if not exists public.anza_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists anza_history_user_idx on public.anza_history(user_id, created_at desc);
alter table public.anza_history enable row level security;
drop policy if exists "history read own" on public.anza_history;
create policy "history read own" on public.anza_history for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.anza_history from authenticated, anon;
revoke all on public.anza_history from anon;

create or replace function public.anza_snapshot(uid uuid, snap jsonb, force boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if snap is null or snap = '{}'::jsonb then return; end if;
  if not force and exists (select 1 from public.anza_history where user_id = uid and created_at > now() - interval '1 hour') then return; end if;
  insert into public.anza_history (user_id, data) values (uid, snap);
  delete from public.anza_history where user_id = uid and id not in (
    select id from public.anza_history where user_id = uid order by created_at desc, id desc limit 30);
end $$;
revoke all on function public.anza_snapshot(uuid, jsonb, boolean) from public, anon, authenticated;

create or replace function public.anza_state_history()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.data is distinct from new.data then
    perform public.anza_snapshot(old.user_id, old.data, false);
  end if;
  return new;
end $$;

drop trigger if exists anza_state_history on public.anza_state;
create trigger anza_state_history before update on public.anza_state
for each row execute function public.anza_state_history();

create or replace function public.my_versions()
returns table (id bigint, created_at timestamptz, contacts int, devis int, rendez_vous int)
language sql stable security invoker set search_path = public as $$
  select h.id, h.created_at,
         jsonb_array_length(coalesce(h.data->'clients', '[]'::jsonb)),
         jsonb_array_length(coalesce(h.data->'quotes', '[]'::jsonb)),
         jsonb_array_length(coalesce(h.data->'calendar', '[]'::jsonb))
  from public.anza_history h where h.user_id = auth.uid() order by h.created_at desc, h.id desc limit 30;
$$;
revoke all on function public.my_versions() from public, anon;
grant execute on function public.my_versions() to authenticated;

create or replace function public.restore_my_version(version_id bigint)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare v jsonb; cur jsonb; t timestamptz := now();
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select data into v from public.anza_history where id = version_id and user_id = auth.uid();
  if v is null then raise exception 'version not found'; end if;
  select data into cur from public.anza_state where user_id = auth.uid();
  perform public.anza_snapshot(auth.uid(), cur, true);
  update public.anza_state set data = v, updated_at = t where user_id = auth.uid();
  return t;
end $$;
revoke all on function public.restore_my_version(bigint) from public, anon;
grant execute on function public.restore_my_version(bigint) to authenticated;

grant usage on schema public to authenticated, service_role;
grant select, insert on public.anza_state to authenticated;
grant update (data, updated_at) on public.anza_state to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.team_items to authenticated;
grant select on public.anza_history to authenticated;
grant select on public.anza_state to service_role;
grant select, insert on public.ai_usage to service_role;
