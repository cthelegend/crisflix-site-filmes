-- Run after schema.sql and 20261114_security_hardening.sql.
-- Existing account data becomes the first profile without deleting history.
begin;

create table if not exists public.viewing_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 1 and 3),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  avatar_url text check (avatar_url is null or octet_length(avatar_url) <= 4096),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slot),
  unique (user_id, id)
);
alter table public.viewing_profiles enable row level security;
revoke all on public.viewing_profiles from anon, public, authenticated;
grant select, insert on public.viewing_profiles to authenticated;
grant update (display_name, avatar_url) on public.viewing_profiles to authenticated;
drop policy if exists viewing_profiles_own on public.viewing_profiles;
create policy viewing_profiles_own on public.viewing_profiles for all to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

insert into public.viewing_profiles (id, user_id, slot, display_name, avatar_url)
select u.id, u.id, 1,
  left(coalesce(nullif(btrim(p.display_name), ''), nullif(btrim(u.raw_user_meta_data ->> 'display_name'), ''), split_part(u.email, '@', 1), 'Meu perfil'), 80),
  p.avatar_url
from auth.users u left join public.profiles p on p.id = u.id
on conflict (user_id, slot) do nothing;

drop trigger if exists viewing_profiles_updated_at on public.viewing_profiles;
create trigger viewing_profiles_updated_at before update on public.viewing_profiles
for each row execute function public.handle_updated_at();

alter table public.user_media_state add column if not exists profile_id uuid;
update public.user_media_state set profile_id = user_id where profile_id is null;
alter table public.user_media_state alter column profile_id set not null;
-- A composite foreign key prevents attaching another account's profile to one's own rows.
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.user_media_state'::regclass and conname = 'media_profile_owner_fk') then
    alter table public.user_media_state add constraint media_profile_owner_fk
      foreign key (user_id, profile_id) references public.viewing_profiles(user_id, id) on delete cascade;
  end if;
end $$;
alter table public.user_media_state drop constraint if exists user_media_state_pkey;
alter table public.user_media_state add primary key (user_id, profile_id, media_type, media_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare profile_name text;
begin
  profile_name := left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1), 'Meu perfil'), 80);
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, profile_name, null) on conflict (id) do nothing;
  insert into public.viewing_profiles (id, user_id, slot, display_name)
  values (new.id, new.id, 1, profile_name) on conflict (user_id, slot) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Slot CHECK + UNIQUE enforces the limit even with concurrent/direct API writes.
-- Invoker permissions and RLS apply; the caller cannot choose another owner.
create or replace function public.create_viewing_profile(p_display_name text, p_avatar_url text default null, p_expected_user_id uuid default auth.uid())
returns public.viewing_profiles language plpgsql security invoker set search_path = '' as $$
declare result public.viewing_profiles; candidate smallint;
begin
  if auth.uid() is null then raise exception 'Sessão indisponível.'; end if;
  if p_expected_user_id is distinct from auth.uid() then raise exception 'Sessão alterada. Tente novamente.'; end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 80 then
    raise exception 'Use um nome entre 1 e 80 caracteres.';
  end if;
  if p_avatar_url is not null and p_avatar_url !~ '^/avatars/preset-[1-6]\.svg$' then
    raise exception 'Escolha um avatar disponível.';
  end if;
  for candidate in 1..3 loop
    insert into public.viewing_profiles (user_id, slot, display_name, avatar_url)
    values (auth.uid(), candidate, btrim(p_display_name), p_avatar_url)
    on conflict (user_id, slot) do nothing returning * into result;
    if result.id is not null then return result; end if;
  end loop;
  raise exception 'Esta conta já possui 3 perfis.';
end;
$$;
revoke execute on function public.create_viewing_profile(text, text, uuid) from public, anon;
grant execute on function public.create_viewing_profile(text, text, uuid) to authenticated;

-- Each account may overwrite only one PNG per owned profile (plus the legacy avatar).
drop policy if exists avatars_insert_own on storage.objects;
create policy avatars_insert_own on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and exists (
    select 1 from public.viewing_profiles p where p.user_id = (select auth.uid())
      and name = p.user_id::text || '/' || p.id::text || '.png'
  )
);
drop policy if exists avatars_update_own on storage.objects;
create policy avatars_update_own on storage.objects for update to authenticated
using (bucket_id = 'avatars' and exists (
  select 1 from public.viewing_profiles p where p.user_id = (select auth.uid())
    and name = p.user_id::text || '/' || p.id::text || '.png'
))
with check (bucket_id = 'avatars' and exists (
  select 1 from public.viewing_profiles p where p.user_id = (select auth.uid())
    and name = p.user_id::text || '/' || p.id::text || '.png'
));

notify pgrst, 'reload schema';
commit;
