import { Movie } from "@/lib/tmdb";

const COOKIE_NAME = "crisflix_continue";
const MAX_ITEMS = 8;

export interface ContinueWatchingEntry {
  id: number;
  type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  season?: number;
  episode?: number;
  progressSeconds?: number;
  runtimeSeconds?: number;
  nextEpisode?: {
    season: number;
    episode: number;
  } | null;
  updatedAt: number;
}

function parseCookieValue(value: string) {
  try {
    return JSON.parse(decodeURIComponent(value)) as ContinueWatchingEntry[];
  } catch {
    return [];
  }
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const found = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return found ? found.slice(name.length + 1) : null;
}

function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
}

export function getContinueWatching() {
  const cookie = getCookie(COOKIE_NAME);
  if (!cookie) return [];
  return parseCookieValue(cookie).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getContinueWatchingItem(type: "movie" | "tv", id: number) {
  return getContinueWatching().find((item) => item.type === type && item.id === id) || null;
}

export function saveContinueWatching(entry: ContinueWatchingEntry) {
  const current = getContinueWatching().filter((item) => !(item.type === entry.type && item.id === entry.id));
  const next = [entry, ...current].slice(0, MAX_ITEMS);
  setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(next)));
  window.dispatchEvent(new CustomEvent("continue-watching-updated"));
}

export function toMovieCardItem(entry: ContinueWatchingEntry): Movie {
  return {
    id: entry.id,
    title: entry.type === "movie" ? entry.title : undefined,
    name: entry.type === "tv" ? entry.title : undefined,
    poster_path: entry.poster_path,
    backdrop_path: entry.backdrop_path,
    overview: "",
    vote_average: entry.vote_average,
    release_date: entry.release_date,
    first_air_date: entry.first_air_date,
    genre_ids: [],
    media_type: entry.type,
  };
}

export function getProgressRatio(entry?: ContinueWatchingEntry | null) {
  if (!entry?.progressSeconds || !entry.runtimeSeconds || entry.runtimeSeconds <= 0) return 0;
  return Math.min(entry.progressSeconds / entry.runtimeSeconds, 1);
}

export function buildWatchPath({
  type,
  id,
  season,
  episode,
  progressSeconds,
}: {
  type: "movie" | "tv";
  id: number;
  season?: number;
  episode?: number;
  progressSeconds?: number;
}) {
  const params = new URLSearchParams();

  if (type === "tv") {
    if (season) params.set("s", String(season));
    if (episode) params.set("e", String(episode));
  }

  if (progressSeconds && progressSeconds > 0) {
    params.set("t", String(Math.floor(progressSeconds)));
  }

  const query = params.toString();
  return `/watch/${type}/${id}${query ? `?${query}` : ""}`;
}
