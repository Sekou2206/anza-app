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
  if not public.mfa_ok_for(auth.uid(), auth.jwt() ->> 'aal') then raise exception 'mfa required'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

create or replace view public.clients_overview with (security_invoker = true) as
select s.user_id, u.email, s.plan,
       s.data->'profile'->>'business' as activite,
       s.data->'profile'->>'first' as prenom,
       jsonb_array_length(coalesce(s.data->'clients', '[]'::jsonb)) as nb_contacts,
       s.updated_at as derniere_activite,
       'AZ' || case when s.plan = 'magasin' then 'M' else 'B' end || upper(substr(replace(s.user_id::text, '-', ''), 1, 6)) as code_anza
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
  if not public.mfa_ok_for(auth.uid(), auth.jwt() ->> 'aal') then raise exception 'mfa required'; end if;
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

create or replace function public.mfa_ok_for(uid uuid, aal text)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select coalesce(aal, '') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = uid and f.status = 'verified');
$$;
revoke all on function public.mfa_ok_for(uuid, text) from public, anon, authenticated;
grant execute on function public.mfa_ok_for(uuid, text) to service_role;

create or replace function public.mfa_ok()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select public.mfa_ok_for(auth.uid(), auth.jwt() ->> 'aal');
$$;
revoke all on function public.mfa_ok() from public, anon;
grant execute on function public.mfa_ok() to authenticated;

drop policy if exists "mfa state" on public.anza_state;
create policy "mfa state" on public.anza_state as restrictive for all to authenticated using (public.mfa_ok()) with check (public.mfa_ok());
drop policy if exists "mfa messages" on public.messages;
create policy "mfa messages" on public.messages as restrictive for all to authenticated using (public.mfa_ok()) with check (public.mfa_ok());
drop policy if exists "mfa team" on public.team_items;
create policy "mfa team" on public.team_items as restrictive for all to authenticated using (public.mfa_ok());
drop policy if exists "mfa history" on public.anza_history;
create policy "mfa history" on public.anza_history as restrictive for all to authenticated using (public.mfa_ok());

create or replace function public.has_plan()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.anza_state s where s.user_id = auth.uid() and s.plan in ('stand', 'boutique', 'magasin'));
$$;
revoke all on function public.has_plan() from public, anon;
grant execute on function public.has_plan() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pages', 'pages', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "anza media read" on storage.objects;
drop policy if exists "anza media insert" on storage.objects;
drop policy if exists "anza media update" on storage.objects;
drop policy if exists "anza media delete" on storage.objects;
create policy "anza media read" on storage.objects for select to authenticated
  using (bucket_id in ('media', 'pages') and (storage.foldername(name))[1] = auth.uid()::text and public.mfa_ok());
create policy "anza media insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'pages') and (storage.foldername(name))[1] = auth.uid()::text and public.mfa_ok() and public.has_plan());
create policy "anza media update" on storage.objects for update to authenticated
  using (bucket_id in ('media', 'pages') and (storage.foldername(name))[1] = auth.uid()::text and public.mfa_ok())
  with check (bucket_id in ('media', 'pages') and (storage.foldername(name))[1] = auth.uid()::text and public.mfa_ok() and public.has_plan());
create policy "anza media delete" on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'pages') and (storage.foldername(name))[1] = auth.uid()::text and public.mfa_ok());

create table if not exists public.pages (
  slug text primary key check (slug ~ '^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])$'),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  published boolean not null default false,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  updated_at timestamptz not null default now()
);
alter table public.pages enable row level security;
drop policy if exists "pages public read" on public.pages;
drop policy if exists "pages own read" on public.pages;
drop policy if exists "pages own insert" on public.pages;
drop policy if exists "pages own update" on public.pages;
drop policy if exists "pages own delete" on public.pages;
drop policy if exists "mfa pages" on public.pages;
create policy "pages public read" on public.pages for select to anon using (published = true);
create policy "pages own read" on public.pages for select to authenticated using (user_id = auth.uid() or published = true);
create policy "pages own insert" on public.pages for insert to authenticated with check (user_id = auth.uid() and public.has_plan());
create policy "pages own update" on public.pages for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.has_plan());
create policy "pages own delete" on public.pages for delete to authenticated using (user_id = auth.uid());
create policy "mfa pages" on public.pages as restrictive for all to authenticated using (published = true or public.mfa_ok()) with check (public.mfa_ok());
revoke all on public.pages from anon, authenticated;
grant select (slug, published, data, updated_at) on public.pages to anon;
grant select, insert, update, delete on public.pages to authenticated;

create table if not exists public.page_leads (
  id bigint generated always as identity primary key,
  page_slug text not null references public.pages(slug) on update cascade on delete cascade,
  owner uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'contact' check (kind in ('contact', 'booking')),
  name text not null check (char_length(name) between 1 and 80),
  contact text not null check (char_length(contact) between 3 and 120),
  message text check (message is null or char_length(message) <= 1000),
  wish_date date,
  wish_time text check (wish_time is null or wish_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  imported boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists page_leads_owner_idx on public.page_leads(owner, imported, created_at);
create index if not exists page_leads_slug_idx on public.page_leads(page_slug, created_at);

create or replace function public.page_leads_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  select p.user_id into o from public.pages p where p.slug = new.page_slug and p.published = true;
  if o is null then raise exception 'page not found'; end if;
  if (select count(*) from public.page_leads l where l.page_slug = new.page_slug and l.created_at > now() - interval '1 hour') >= 20 then raise exception 'rate limit'; end if;
  if new.wish_date is not null and (new.wish_date < current_date or new.wish_date > current_date + 200) then raise exception 'bad date'; end if;
  new.owner := o; new.imported := false; new.created_at := now();
  new.name := left(trim(new.name), 80); new.contact := left(trim(new.contact), 120);
  return new;
end $$;
revoke all on function public.page_leads_guard() from public, anon, authenticated;
drop trigger if exists page_leads_guard on public.page_leads;
create trigger page_leads_guard before insert on public.page_leads for each row execute function public.page_leads_guard();

alter table public.page_leads enable row level security;
drop policy if exists "leads public insert" on public.page_leads;
drop policy if exists "leads own read" on public.page_leads;
drop policy if exists "leads own update" on public.page_leads;
drop policy if exists "leads own delete" on public.page_leads;
drop policy if exists "mfa leads read" on public.page_leads;
drop policy if exists "mfa leads update" on public.page_leads;
drop policy if exists "mfa leads delete" on public.page_leads;
create policy "leads public insert" on public.page_leads for insert to anon, authenticated with check (imported = false);
create policy "leads own read" on public.page_leads for select to authenticated using (owner = auth.uid());
create policy "leads own update" on public.page_leads for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "leads own delete" on public.page_leads for delete to authenticated using (owner = auth.uid());
create policy "mfa leads read" on public.page_leads as restrictive for select to authenticated using (public.mfa_ok());
create policy "mfa leads update" on public.page_leads as restrictive for update to authenticated using (public.mfa_ok());
create policy "mfa leads delete" on public.page_leads as restrictive for delete to authenticated using (public.mfa_ok());
revoke all on public.page_leads from anon, authenticated;
grant insert (page_slug, kind, name, contact, message, wish_date, wish_time) on public.page_leads to anon, authenticated;
grant select on public.page_leads to authenticated;
grant update (imported) on public.page_leads to authenticated;
grant delete on public.page_leads to authenticated;
