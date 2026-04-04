export interface ChannelPlayerOption {
  id: string;
  label: string;
  description: string;
  src: string;
  accentClassName: string;
}

export interface ChannelDefinition {
  slug: string;
  title: string;
  logoSrc: string;
  tagline: string;
  description: string;
  accentClassName: string;
  surfaceClassName: string;
  sources: string[];
}

interface ChannelDiagnostic {
  id: string;
  label: string;
  configured: boolean;
}

const SOURCE_LABELS = ["Fonte 1", "Fonte 2"];
const SOURCE_DESCRIPTIONS = [
  "Opção principal para abrir o canal.",
  "Opção alternativa para continuar assistindo.",
];

function parseSources(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() || "").filter(Boolean).slice(0, 2);
}

const channels: ChannelDefinition[] = [
  {
    slug: "espn",
    title: "ESPN",
    logoSrc: "/channel-logos/espn.svg",
    tagline: "Esportes ao vivo",
    description: "Acompanhe jogos, programas e coberturas esportivas em tempo real.",
    accentClassName: "from-[#fb7185] via-[#dc2626] to-[#7f1d1d]",
    surfaceClassName: "from-[#4c0519] via-[#7f1d1d] to-[#111111]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_ESPN_SOURCE_1, import.meta.env.VITE_CHANNEL_ESPN_SOURCE_2),
  },
  {
    slug: "espn-2",
    title: "ESPN 2",
    logoSrc: "/channel-logos/espn2.svg",
    tagline: "Mais eventos ao vivo",
    description: "Uma faixa extra para transmissões simultâneas, debates e especiais.",
    accentClassName: "from-[#fda4af] via-[#dc2626] to-[#7f1d1d]",
    surfaceClassName: "from-[#450a0a] via-[#991b1b] to-[#111111]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_ESPN2_SOURCE_1, import.meta.env.VITE_CHANNEL_ESPN2_SOURCE_2),
  },
  {
    slug: "sportv",
    title: "SporTV",
    logoSrc: "/channel-logos/sportv.svg",
    tagline: "Cobertura esportiva nacional",
    description: "Programação contínua com transmissões, análises e destaques do esporte.",
    accentClassName: "from-[#fca5a5] via-[#dc2626] to-[#7f1d1d]",
    surfaceClassName: "from-[#3f0a0a] via-[#7f1d1d] to-[#111111]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_SPORTV_SOURCE_1, import.meta.env.VITE_CHANNEL_SPORTV_SOURCE_2),
  },
  {
    slug: "premiere",
    title: "Premiere",
    logoSrc: "/channel-logos/premiere.svg",
    tagline: "Futebol o dia todo",
    description: "Tudo para quem quer acompanhar futebol ao vivo e a programação do canal.",
    accentClassName: "from-[#fecaca] via-[#dc2626] to-[#7f1d1d]",
    surfaceClassName: "from-[#4a0d0d] via-[#991b1b] to-[#111111]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_PREMIERE_SOURCE_1, import.meta.env.VITE_CHANNEL_PREMIERE_SOURCE_2),
  },
];

export function getChannels() {
  return channels;
}

export function getChannelBySlug(slug?: string) {
  return channels.find((channel) => channel.slug === slug) || null;
}

export function getChannelPlayerOptions(channel: ChannelDefinition): ChannelPlayerOption[] {
  return channel.sources.map((src, index) => ({
    id: `source-${index + 1}`,
    label: SOURCE_LABELS[index] || `Fonte ${index + 1}`,
    description: SOURCE_DESCRIPTIONS[index] || "Opção disponível para este canal.",
    src,
    accentClassName: index === 0 ? "from-[#ffffff] via-[#d4d4d4] to-[#737373]" : "from-[#fb7185] via-[#dc2626] to-[#7f1d1d]",
  }));
}

export function getChannelDiagnostics(channel: ChannelDefinition): ChannelDiagnostic[] {
  return SOURCE_LABELS.map((label, index) => ({
    id: `source-${index + 1}`,
    label,
    configured: Boolean(channel.sources[index]),
  }));
}
