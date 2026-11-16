import { defaultSiteContent, validateSiteContent } from "../../shared/siteContent.js";
import { getEditorialMedia, type Movie } from "./tmdb";
import type { LibraryEntry } from "./leftLibrary";
export interface MediaReference { id: string; tmdbId: number; type: "movie" | "tv"; title: string }
export interface Scheduled { enabled: boolean; start: string; end: string }
export interface SiteContent {
  version: 1;
  highlights: (MediaReference & { enabled: boolean; subtitle: string })[];
  notices: (Scheduled & { id: string; title: string; message: string; href: string })[];
  themes: (Scheduled & { id: string; name: string; accent: string; background: string })[];
  collections: { id: string; title: string; enabled: boolean; items: MediaReference[] }[];
  library: { custom: boolean; films: LibraryEntry[]; books: LibraryEntry[]; booksEnabled: boolean };
  appearance: { slogan: string; footerNote: string; showDefaultRows: boolean; heroSeconds: number; patternOpacity: number };
}
export const DEFAULT_SITE_CONTENT = defaultSiteContent as SiteContent;
export const parseSiteContent = (v: unknown): SiteContent => validateSiteContent(v) as SiteContent;
export function isScheduledActive(item: Scheduled, now = Date.now()) {
  return item.enabled && (!item.start || Date.parse(item.start) <= now) && (!item.end || Date.parse(item.end) > now);
}
const mediaCache = new Map<string, { expires: number; promise: Promise<Movie> }>();
export async function resolveMedia(refs: MediaReference[]): Promise<Movie[]> {
  const results = await Promise.allSettled(refs.map(ref => {
    const key = `${ref.type}-${ref.tmdbId}`, cached = mediaCache.get(key);
    if (cached && cached.expires > Date.now()) return cached.promise;
    const promise = getEditorialMedia(ref.type, ref.tmdbId).then(m => ({ ...m, media_type: ref.type })).catch(error => { mediaCache.delete(key); throw error; });
    if (mediaCache.size > 300) mediaCache.delete(mediaCache.keys().next().value);
    mediaCache.set(key, { promise, expires: Date.now() + 600000 });
    return promise;
  }));
  return results.flatMap(r => r.status === "fulfilled" ? [r.value as Movie] : []);
}
export async function adminRequest(method = "GET", body?: unknown) {
  const response = await fetch("/api/admin", { method, credentials: "same-origin", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000) });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || "Não foi possível concluir a ação."), { status: response.status });
  return data;
}
