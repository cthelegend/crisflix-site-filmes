export type PlayerMediaType = "movie" | "tv";

interface ProviderContext {
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
}

function parseTemplates(value?: string) {
  return (value || "").split(/\r?\n|\|\|/).map((item) => item.trim()).filter(Boolean);
}

const movieTemplates = parseTemplates(import.meta.env.VITE_PLAYER_DUBBED_MOVIE_TEMPLATE);
const tvTemplates = parseTemplates(import.meta.env.VITE_PLAYER_DUBBED_TV_TEMPLATE);
const episodeTemplates = parseTemplates(import.meta.env.VITE_PLAYER_DUBBED_TV_EPISODE_TEMPLATE);
const tokens: Record<string, keyof ProviderContext> = {
  "{tmdbId}": "tmdbId", "{imdbId}": "imdbId", "{season}": "season", "{episode}": "episode",
};

export function getDubbedPlayerSource(type: PlayerMediaType, context: ProviderContext): string | null {
  const templates = type === "movie" ? movieTemplates
    : context.season && context.episode && episodeTemplates.length ? episodeTemplates : tvTemplates;

  for (const template of templates) {
    let source = template;
    let complete = true;
    for (const [token, key] of Object.entries(tokens)) {
      if (!source.includes(token)) continue;
      const value = context[key];
      if (value === undefined || value === null || value === "") { complete = false; break; }
      source = source.split(token).join(encodeURIComponent(String(value)));
    }
    if (complete) return source;
  }
  return null;
}
