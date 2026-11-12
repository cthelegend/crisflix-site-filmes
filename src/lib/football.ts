export interface FootballTeam {
  name: string;
  image: string | null;
}

export interface FootballPlayer {
  id: string;
  name: string;
  url: string;
  program: string | null;
}

export interface FootballGame {
  slug: string;
  title: string;
  league: string;
  home: FootballTeam;
  away: FootballTeam;
  startsAt: number | null;
  endsAt: number | null;
  playerUrl: string;
  players: FootballPlayer[];
}

export interface EmbedTVEvent {
  slug?: string;
  title?: string;
  league?: { name?: string };
  teams?: { home?: { name?: string; image?: string }; away?: { name?: string; image?: string } };
  time_start?: string;
  time_end?: string;
  players?: string[];
}

export interface EmbedTVChannel { id: string; name: string }
export interface EmbedTVEpg { id: string; data: { title?: string; start_date?: string }[] }
export const FOOTBALL_REFRESH_MS = 60000;

export function footballSlug(title: string) {
  return title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function text(value: unknown, fallback = "") { return typeof value === "string" && value.trim() ? value.trim() : fallback; }
function timestamp(value?: string) { const time = Date.parse(value || ""); return Number.isFinite(time) ? time : null; }
function imageUrl(value?: string) {
  try { const url = new URL(value || ""); return url.protocol === "https:" ? url.href : null; }
  catch { return null; }
}

async function fetchFeed(endpoint: "events" | "channels" | "epg_all", signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = window.setTimeout(abort, 12000);
  try {
    // Same-origin rewrites avoid the provider's CORS restrictions in production and development.
    const response = await fetch(`/api/futebol/${endpoint}`, { signal: controller.signal });
    if (!response.ok) throw new Error("Não foi possível consultar as transmissões agora.");
    return await response.json();
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export async function fetchFootballEvents(signal?: AbortSignal): Promise<EmbedTVEvent[]> {
  const data = await fetchFeed("events", signal);
  if (!Array.isArray(data)) throw new Error("A lista de partidas está temporariamente indisponível.");
  return data;
}

export async function fetchFootballChannels(signal?: AbortSignal): Promise<EmbedTVChannel[]> {
  const data = await fetchFeed("channels", signal) as { channels?: unknown } | null;
  if (!data || !Array.isArray(data.channels)) throw new Error("Canais indisponíveis.");
  return data.channels;
}

export async function fetchFootballEpg(signal?: AbortSignal): Promise<EmbedTVEpg[]> {
  const data = await fetchFeed("epg_all", signal);
  if (!Array.isArray(data)) throw new Error("Programação indisponível.");
  return data;
}

function currentPrograms(epg: EmbedTVEpg[], now: number) {
  const programs = new Map<string, string>();
  for (const channel of epg) {
    if (!channel || !Array.isArray(channel.data) || !text(channel.id)) continue;
    const schedule = channel.data.map((item) => ({ title: text(item?.title), start: timestamp(item?.start_date) }))
      .filter((item): item is { title: string; start: number } => !!item.title && item.start !== null)
      .sort((a, b) => a.start - b.start);
    const index = schedule.findIndex((item) => item.start > now);
    const current = index === -1 ? schedule[schedule.length - 1] : schedule[index - 1];
    // A final EPG entry has no known end; avoid showing it indefinitely when the guide is stale.
    if (current && (index !== -1 || now - current.start < 4 * 60 * 60 * 1000)) programs.set(channel.id, current.title);
  }
  return programs;
}

export function buildFootballGames(events: EmbedTVEvent[], channels: EmbedTVChannel[] = [], epg: EmbedTVEpg[] = []): FootballGame[] {
  const now = Date.now();
  const channelNames = new Map(channels.filter((channel) => channel && text(channel.id) && text(channel.name)).map((channel) => [channel.id, channel.name]));
  const programs = currentPrograms(epg, now);
  const games = new Map<string, FootballGame>();
  for (const event of events) {
    if (!event || !text(event.title)) continue;
    const title = text(event.title);
    const league = text(event.league?.name, "Futebol");
    // Events includes other sports without a sport field; exclude their leagues from Futebol.
    if (/\b(NFL|CFL|NCAAF|NHL|NBA|NBB|WNBA|UFC|ATP|WTA|MMA)\b|euroliga|euroleague|superliga (feminina|masculina)|basquete|basketball|v[oô]lei|volleyball|h[oó]quei|hockey|futebol americano|american football|t[eê]nis|formula|fórmula/i.test(league)) continue;
    const startsAt = timestamp(event.time_start);
    const endsAt = timestamp(event.time_end);
    if (endsAt && endsAt <= now) continue;
    const slug = text(event.slug).match(/^[a-z0-9-]+$/i) ? text(event.slug) : footballSlug(title);
    if (!slug) continue;
    const players = new Map<string, FootballPlayer>();
    for (const source of Array.isArray(event.players) ? event.players : []) {
      try {
        const url = new URL(source);
        if (url.protocol !== "https:" || !(url.hostname === "embedtv.cc" || url.hostname.endsWith(".embedtv.cc"))) continue;
        const parts = url.pathname.split("/").filter(Boolean);
        const id = parts[parts.length - 1] || "";
        if (!id || players.has(id)) continue;
        players.set(id, { id, name: channelNames.get(id) || id.toUpperCase(), url: url.href, program: programs.get(id) || null });
      } catch { /* Skip invalid player links without making the whole event unavailable. */ }
    }
    const sources = [...players.values()];
    if (!sources.length) continue;
    const [homeName, awayName] = title.split(/\s+[x×]\s+/i);
    const previous = games.get(slug);
    const merged = previous ? [...new Map([...previous.players, ...sources].map((player) => [player.id, player])).values()] : sources;
    games.set(slug, {
      slug, title, league, startsAt, endsAt,
      home: { name: text(event.teams?.home?.name, homeName || title), image: imageUrl(event.teams?.home?.image) },
      away: { name: text(event.teams?.away?.name, awayName || "Adversário"), image: imageUrl(event.teams?.away?.image) },
      players: merged, playerUrl: merged[0].url,
    });
  }
  return [...games.values()].sort((a, b) => (a.startsAt || 0) - (b.startsAt || 0));
}

export function formatGameCountdown(startsAt: number, now: number) {
  const seconds = Math.max(0, Math.ceil((startsAt - now) / 1000));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}
