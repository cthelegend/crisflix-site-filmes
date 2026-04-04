export type AudioTrack = "dubbed" | "subbed";
export type PlayerMediaType = "movie" | "tv";

interface ProviderContext {
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
}

interface PlayerProvider {
  audio: AudioTrack;
  label: string;
  description: string;
  accentClassName: string;
  movieTemplates: string[];
  tvTemplates: string[];
  tvEpisodeTemplates: string[];
}

interface ProviderDiagnostic {
  audio: AudioTrack;
  label: string;
  templatesConsidered: number;
  resolvedSrc: string | null;
}

function parseTemplates(value?: string) {
  if (!value) return [];

  return value
    .split(/\r?\n|\|\|/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const providers: PlayerProvider[] = [
  {
    audio: "dubbed",
    label: "Dublado",
    description: "Audio principal em portugues quando houver uma fonte configurada.",
    accentClassName: "from-[#e50914] via-[#ff6a3d] to-[#f5c518]",
    movieTemplates: parseTemplates(import.meta.env.VITE_PLAYER_DUBBED_MOVIE_TEMPLATE),
    tvTemplates: parseTemplates(import.meta.env.VITE_PLAYER_DUBBED_TV_TEMPLATE),
    tvEpisodeTemplates: parseTemplates(import.meta.env.VITE_PLAYER_DUBBED_TV_EPISODE_TEMPLATE),
  },
  {
    audio: "subbed",
    label: "Legendado",
    description: "Audio original com legenda padrao da fonte configurada.",
    accentClassName: "from-[#72d5ff] via-[#3f8cff] to-[#6246ea]",
    movieTemplates: parseTemplates(import.meta.env.VITE_PLAYER_SUBBED_MOVIE_TEMPLATE),
    tvTemplates: parseTemplates(import.meta.env.VITE_PLAYER_SUBBED_TV_TEMPLATE),
    tvEpisodeTemplates: parseTemplates(import.meta.env.VITE_PLAYER_SUBBED_TV_EPISODE_TEMPLATE),
  },
];

const TOKEN_MAP: Record<string, keyof ProviderContext> = {
  "{tmdbId}": "tmdbId",
  "{imdbId}": "imdbId",
  "{season}": "season",
  "{episode}": "episode",
};

function fillTemplate(template: string, context: ProviderContext) {
  let output = template;

  for (const [token, key] of Object.entries(TOKEN_MAP)) {
    if (!output.includes(token)) continue;

    const value = context[key];
    if (value === undefined || value === null || value === "") {
      return null;
    }

    output = output.replaceAll(token, encodeURIComponent(String(value)));
  }

  return output;
}

export function getAvailablePlayerOptions(type: PlayerMediaType, context: ProviderContext) {
  return providers
    .map((provider) => {
      const templates =
        type === "movie"
          ? provider.movieTemplates
          : context.season && context.episode
            ? provider.tvEpisodeTemplates.length
              ? provider.tvEpisodeTemplates
              : provider.tvTemplates
            : provider.tvTemplates;
      if (!templates.length) return null;

      const src = templates
        .map((template) => fillTemplate(template, context))
        .find(Boolean);
      if (!src) return null;

      return {
        audio: provider.audio,
        label: provider.label,
        description: provider.description,
        accentClassName: provider.accentClassName,
        src,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function getPlayerDiagnostics(type: PlayerMediaType, context: ProviderContext) {
  return providers.map<ProviderDiagnostic>((provider) => {
    const templates =
      type === "movie"
        ? provider.movieTemplates
        : context.season && context.episode
          ? provider.tvEpisodeTemplates.length
            ? provider.tvEpisodeTemplates
            : provider.tvTemplates
          : provider.tvTemplates;

    const resolvedSrc =
      templates
        .map((template) => fillTemplate(template, context))
        .find(Boolean) || null;

    return {
      audio: provider.audio,
      label: provider.label,
      templatesConsidered: templates.length,
      resolvedSrc,
    };
  });
}
