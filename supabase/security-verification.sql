-- Read-only checks. Execute in SQL Editor after applying the migration.
select n.nspname, c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'user_media_state');
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where (schemaname = 'public' and tablename in ('profiles', 'user_media_state'))
or (schemaname = 'storage' and tablename = 'objects');
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'avatars';
select conname, convalidated from pg_constraint
where conrelid in ('public.profiles'::regclass, 'public.user_media_state'::regclass);
-- After the multiple-profiles migration:
select user_id, count(*) as profile_count from public.viewing_profiles group by user_id having count(*) > 3;
select c.conname, pg_get_constraintdef(c.oid) from pg_constraint c
where c.conrelid in ('public.viewing_profiles'::regclass, 'public.user_media_state'::regclass);
-- Any additional permissive policy must be reviewed: PostgreSQL combines permissive policies with OR.
