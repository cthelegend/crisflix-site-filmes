import { Movie } from "@/lib/tmdb";
import { canStoreFunctionalData, getCookieConsent, subscribeCookieConsent } from "@/lib/cookieConsent";

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

const STORAGE_KEY = "foice-filme:guest-progress:v2";
let visitProgress: ContinueWatchingEntry[] = [];

export function validateContinueWatching(value: unknown): ContinueWatchingEntry[] {
  if (!Array.isArray(value)) return [];
  const image = (v: unknown) => typeof v === "string" && /^\/[a-zA-Z0-9_.-]+$/.test(v) ? v : null;
  const number = (v: unknown) => typeof v === "number" && Number.isSafeInteger(v) && v > 0 && v <= 1000000000 ? v : undefined;
  return value.slice(0, MAX_ITEMS).flatMap((entry) => {
    if (!entry || !number(entry.id) || !["movie", "tv"].includes(entry.type) || typeof entry.title !== "string"
      || typeof entry.updatedAt !== "number" || !Number.isFinite(entry.updatedAt) || entry.updatedAt <= 0) return [];
    return [{
      id: entry.id, type: entry.type, title: entry.title.slice(0, 300),
      poster_path: image(entry.poster_path), backdrop_path: image(entry.backdrop_path),
      vote_average: typeof entry.vote_average === "number" && Number.isFinite(entry.vote_average) ? Math.max(0, Math.min(10, entry.vote_average)) : 0,
      release_date: typeof entry.release_date === "string" ? entry.release_date.slice(0, 10) : undefined,
      first_air_date: typeof entry.first_air_date === "string" ? entry.first_air_date.slice(0, 10) : undefined,
      season: number(entry.season), episode: number(entry.episode),
      progressSeconds: number(entry.progressSeconds), runtimeSeconds: number(entry.runtimeSeconds),
      nextEpisode: number(entry.nextEpisode?.season) && number(entry.nextEpisode?.episode)
        ? { season: entry.nextEpisode.season, episode: entry.nextEpisode.episode } : null,
      updatedAt: entry.updatedAt,
    } as ContinueWatchingEntry];
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function clearLegacyProgressCookie() {
  if (typeof document === "undefined") return;
  // Old cookies have no account ownership: discard rather than import them.
  if (document.cookie.split("; ").some((item) => item.startsWith(`${COOKIE_NAME}=`))) {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; path=/; SameSite=Lax`;
  }
}

export function getContinueWatching() {
  if (typeof document === "undefined") return [];
  clearLegacyProgressCookie();
  if (!canStoreFunctionalData()) return [...visitProgress];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = raw && raw.length <= 50000 ? validateContinueWatching(JSON.parse(raw)) : [];
    const seen = new Set<string>();
    return [...visitProgress, ...stored].sort((a, b) => b.updatedAt - a.updatedAt).filter((item) => {
      const key = `${item.type}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    }).slice(0, MAX_ITEMS);
  } catch { return [...visitProgress]; }
}

export function getContinueWatchingItem(type: "movie" | "tv", id: number) {
  return getContinueWatching().find((item) => item.type === type && item.id === id) || null;
}

export function saveContinueWatching(entry: ContinueWatchingEntry) {
  const current = getContinueWatching().filter((item) => !(item.type === entry.type && item.id === entry.id));
  const next = validateContinueWatching([entry, ...current]);
  visitProgress = next;
  try { if (canStoreFunctionalData()) localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage disabled or full */ }
  window.dispatchEvent(new CustomEvent("continue-watching-updated"));
}
subscribeCookieConsent(() => {
  try {
    if (canStoreFunctionalData()) localStorage.setItem(STORAGE_KEY, JSON.stringify(getContinueWatching()));
    else if (getCookieConsent()?.functional === false) localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage unavailable */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("continue-watching-updated"));
});

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
