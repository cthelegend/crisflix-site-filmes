import { ContinueWatchingEntry } from "@/lib/continueWatching";
import { supabase } from "@/lib/supabase";

type MediaType = "movie" | "tv";

export interface UserMediaState {
  user_id: string;
  media_type: MediaType;
  media_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string | null;
  first_air_date?: string | null;
  season?: number | null;
  episode?: number | null;
  progress_seconds?: number | null;
  runtime_seconds?: number | null;
  next_episode?: { season: number; episode: number } | null;
  is_favorite: boolean;
  in_watchlist: boolean;
  updated_at?: string;
}

export interface MediaIdentity {
  media_type: MediaType;
  media_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string | null;
  first_air_date?: string | null;
}

function mapRowToContinueWatching(row: UserMediaState): ContinueWatchingEntry {
  return {
    id: row.media_id,
    type: row.media_type,
    title: row.title,
    poster_path: row.poster_path,
    backdrop_path: row.backdrop_path,
    vote_average: row.vote_average,
    release_date: row.release_date || undefined,
    first_air_date: row.first_air_date || undefined,
    season: row.season || undefined,
    episode: row.episode || undefined,
    progressSeconds: row.progress_seconds || undefined,
    runtimeSeconds: row.runtime_seconds || undefined,
    nextEpisode: row.next_episode || null,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
  };
}

function basePayload(userId: string, media: MediaIdentity) {
  return {
    user_id: userId,
    media_type: media.media_type,
    media_id: media.media_id,
    title: media.title,
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    release_date: media.release_date || null,
    first_air_date: media.first_air_date || null,
  };
}

export async function fetchUserMediaState(userId: string, mediaType: MediaType, mediaId: number) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_media_state")
    .select("*")
    .eq("user_id", userId)
    .eq("media_type", mediaType)
    .eq("media_id", mediaId)
    .maybeSingle<UserMediaState>();

  if (error) throw error;
  return data;
}

export async function upsertUserMediaState(
  userId: string,
  media: MediaIdentity,
  patch: Partial<Omit<UserMediaState, keyof MediaIdentity | "user_id" | "media_id" | "media_type">>,
) {
  if (!supabase) return null;

  const payload = {
    ...basePayload(userId, media),
    ...patch,
  };

  const { data, error } = await supabase
    .from("user_media_state")
    .upsert(payload, { onConflict: "user_id,media_type,media_id" })
    .select("*")
    .single<UserMediaState>();

  if (error) throw error;
  return data;
}

export async function toggleFavorite(userId: string, media: MediaIdentity, nextValue: boolean) {
  return upsertUserMediaState(userId, media, { is_favorite: nextValue });
}

export async function toggleWatchlist(userId: string, media: MediaIdentity, nextValue: boolean) {
  return upsertUserMediaState(userId, media, { in_watchlist: nextValue });
}

export async function saveRemoteContinueWatching(userId: string, entry: ContinueWatchingEntry) {
  return upsertUserMediaState(
    userId,
    {
      media_type: entry.type,
      media_id: entry.id,
      title: entry.title,
      poster_path: entry.poster_path,
      backdrop_path: entry.backdrop_path,
      vote_average: entry.vote_average,
      release_date: entry.release_date,
      first_air_date: entry.first_air_date,
    },
    {
      season: entry.season || null,
      episode: entry.episode || null,
      progress_seconds: entry.progressSeconds || null,
      runtime_seconds: entry.runtimeSeconds || null,
      next_episode: entry.nextEpisode || null,
    },
  );
}

export async function fetchRemoteContinueWatching(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_media_state")
    .select("*")
    .eq("user_id", userId)
    .gt("progress_seconds", 0)
    .order("updated_at", { ascending: false })
    .returns<UserMediaState[]>();

  if (error) throw error;
  return (data || []).map(mapRowToContinueWatching);
}

export async function fetchFavorites(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_media_state")
    .select("*")
    .eq("user_id", userId)
    .eq("is_favorite", true)
    .order("updated_at", { ascending: false })
    .returns<UserMediaState[]>();

  if (error) throw error;
  return data || [];
}

export async function fetchWatchlist(userId: string) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("user_media_state")
    .select("*")
    .eq("user_id", userId)
    .eq("in_watchlist", true)
    .order("updated_at", { ascending: false })
    .returns<UserMediaState[]>();

  if (error) throw error;
  return data || [];
}
