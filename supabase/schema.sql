create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_media_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie', 'tv')),
  media_id bigint not null,
  title text not null,
  poster_path text,
  backdrop_path text,
  vote_average numeric not null default 0,
  release_date text,
  first_air_date text,
  season integer,
  episode integer,
  progress_seconds integer,
  runtime_seconds integer,
  next_episode jsonb,
  is_favorite boolean not null default false,
  in_watchlist boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, media_type, media_id)
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

drop trigger if exists user_media_state_updated_at on public.user_media_state;
create trigger user_media_state_updated_at
before update on public.user_media_state
for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.user_media_state enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "media_select_own" on public.user_media_state;
create policy "media_select_own" on public.user_media_state
for select using (auth.uid() = user_id);

drop policy if exists "media_write_own" on public.user_media_state;
create policy "media_write_own" on public.user_media_state
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
