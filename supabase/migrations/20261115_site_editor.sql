begin;
create table if not exists public.site_editor (
  id integer primary key check (id = 1),
  revision bigint not null default 0,
  draft jsonb not null default '{}'::jsonb,
  published jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint bounded_site_editor check (octet_length(draft::text) < 400000 and octet_length(published::text) < 400000)
);
create table if not exists public.admin_sessions (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null
);
create table if not exists public.admin_login_limits (
  bucket text primary key,
  window_start timestamptz not null,
  attempts integer not null default 0
);
alter table public.site_editor enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_login_limits enable row level security;
revoke all on public.site_editor, public.admin_sessions, public.admin_login_limits from public, anon, authenticated;
grant all on public.site_editor, public.admin_sessions, public.admin_login_limits to service_role;

-- Server-only RPCs. RLS has no public policies; browsers cannot bypass /api/admin.
create or replace function public.save_site_editor(expected_revision bigint, new_draft jsonb, publish_now boolean)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_row public.site_editor%rowtype; result jsonb;
begin
  insert into public.site_editor(id) values (1) on conflict do nothing;
  select * into current_row from public.site_editor where id = 1 for update;
  if current_row.revision <> expected_revision then return null; end if;
  if jsonb_typeof(new_draft) <> 'object' or new_draft->>'version' <> '1' then raise exception 'Invalid content'; end if;
  update public.site_editor set
    revision = revision + 1, draft = new_draft,
    history = case when publish_now then
      (select coalesce(jsonb_agg(value), '[]'::jsonb) from (
        select value from jsonb_array_elements(jsonb_build_array(jsonb_build_object('at', now(), 'content', published)) || history) with ordinality as h(value, n) order by n limit 10
      ) as limited) else history end,
    published = case when publish_now then new_draft else published end,
    updated_at = now()
  where id = 1 returning jsonb_build_object('revision', revision, 'draft', draft, 'published', published, 'history', history) into result;
  return result;
end; $$;

create or replace function public.admin_login_attempt(bucket_key text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare count_now integer; global_count integer;
begin
  if bucket_key !~ '^[a-f0-9]{64}$' then return false; end if;
  delete from public.admin_login_limits where window_start < now() - interval '1 day';
  delete from public.admin_sessions where expires_at < now();
  insert into public.admin_login_limits(bucket, window_start, attempts) values ('global', now(), 1)
  on conflict(bucket) do update set attempts = case when admin_login_limits.window_start < now() - interval '15 minutes' then 1 else admin_login_limits.attempts + 1 end,
    window_start = case when admin_login_limits.window_start < now() - interval '15 minutes' then now() else admin_login_limits.window_start end
  returning attempts into global_count;
  insert into public.admin_login_limits(bucket, window_start, attempts) values (bucket_key, now(), 1)
  on conflict(bucket) do update set attempts = case when admin_login_limits.window_start < now() - interval '15 minutes' then 1 else admin_login_limits.attempts + 1 end,
    window_start = case when admin_login_limits.window_start < now() - interval '15 minutes' then now() else admin_login_limits.window_start end
  returning attempts into count_now;
  return count_now <= 8 and global_count <= 200;
end; $$;
revoke all on function public.save_site_editor(bigint,jsonb,boolean), public.admin_login_attempt(text) from public, anon, authenticated;
grant execute on function public.save_site_editor(bigint,jsonb,boolean), public.admin_login_attempt(text) to service_role;
commit;
