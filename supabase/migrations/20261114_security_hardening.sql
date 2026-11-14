-- Review in staging, then execute in Supabase SQL Editor with the owner role.
-- Does not delete users, media history or existing Storage objects.
begin;

alter table public.profiles enable row level security;
alter table public.user_media_state enable row level security;
revoke all on public.profiles, public.user_media_state from anon, public;
grant select, insert, update, delete on public.profiles, public.user_media_state to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles for all to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
drop policy if exists "media_select_own" on public.user_media_state;
create policy "media_select_own" on public.user_media_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "media_write_own" on public.user_media_state;
create policy "media_write_own" on public.user_media_state for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create or replace function public.handle_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    split_part(new.email, '@', 1), 'Meu perfil'), 80), null)
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_updated_at() from public, anon, authenticated;

-- NOT VALID preserves historical rows while enforcing all new inserts/updates.
-- Validate existing data separately after review, without silent truncation/deletion.
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.profiles'::regclass and conname = 'profiles_input_bounds') then
    alter table public.profiles add constraint profiles_input_bounds check (
      (display_name is null or char_length(btrim(display_name)) between 1 and 80)
      and (avatar_url is null or octet_length(avatar_url) <= 4096)
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conrelid = 'public.user_media_state'::regclass and conname = 'media_input_bounds') then
    alter table public.user_media_state add constraint media_input_bounds check (
      media_id between 1 and 1000000000 and char_length(title) between 1 and 300
      and vote_average between 0 and 10
      and (poster_path is null or poster_path ~ '^/[a-zA-Z0-9_.-]{1,255}$')
      and (backdrop_path is null or backdrop_path ~ '^/[a-zA-Z0-9_.-]{1,255}$')
      and (season is null or season between 1 and 10000)
      and (episode is null or episode between 1 and 100000)
      and (progress_seconds is null or progress_seconds between 0 and 100000000)
      and (runtime_seconds is null or runtime_seconds between 0 and 100000000)
      and (release_date is null or char_length(release_date) <= 10)
      and (first_air_date is null or char_length(first_air_date) <= 10)
      and (next_episode is null or (
        jsonb_typeof(next_episode) = 'object' and octet_length(next_episode::text) <= 128
        and next_episode ? 'season' and next_episode ? 'episode'
        and next_episode ->> 'season' ~ '^[1-9][0-9]{0,3}$'
        and next_episode ->> 'episode' ~ '^[1-9][0-9]{0,4}$'
      ))
    ) not valid;
  end if;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
-- Public URLs still work through the public bucket, without granting directory listing.
drop policy if exists "avatars_public_read" on storage.objects;
drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.png'
);
drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.png')
with check (bucket_id = 'avatars' and name = (select auth.uid())::text || '/avatar.png');

commit;
