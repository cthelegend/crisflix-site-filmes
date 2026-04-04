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
  ringClassName: string;
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
    logoSrc: "https://a1.espncdn.com/combiner/i?img=%2Fi%2Fespn%2Fespn_logos%2Fespn_red.png",
    tagline: "Esportes ao vivo",
    description: "Acompanhe jogos, programas e coberturas esportivas em tempo real.",
    accentClassName: "from-[#ef4444] via-[#dc2626] to-[#991b1b]",
    surfaceClassName: "from-[#230606] via-[#130909] to-[#090909]",
    ringClassName: "border-red-500/30",
    sources: parseSources(import.meta.env.VITE_CHANNEL_ESPN_SOURCE_1, import.meta.env.VITE_CHANNEL_ESPN_SOURCE_2),
  },
  {
    slug: "espn-2",
    title: "ESPN 2",
    logoSrc: "https://a1.espncdn.com/combiner/i?img=%2Fi%2Fespn%2Fespn_logos%2Fespn_red.png",
    tagline: "Mais eventos ao vivo",
    description: "Uma faixa extra para transmissões simultâneas, debates e especiais.",
    accentClassName: "from-[#fb7185] via-[#dc2626] to-[#991b1b]",
    surfaceClassName: "from-[#240707] via-[#140909] to-[#090909]",
    ringClassName: "border-rose-400/30",
    sources: parseSources(import.meta.env.VITE_CHANNEL_ESPN2_SOURCE_1, import.meta.env.VITE_CHANNEL_ESPN2_SOURCE_2),
  },
  {
    slug: "sportv",
    title: "SporTV",
    logoSrc: "https://marcasmais.com.br/wp-content/uploads/2023/08/Sportv-Logo.jpg",
    tagline: "Cobertura esportiva nacional",
    description: "Programação contínua com transmissões, análises e destaques do esporte.",
    accentClassName: "from-[#60a5fa] via-[#2563eb] to-[#1d4ed8]",
    surfaceClassName: "from-[#090d24] via-[#0b102d] to-[#090909]",
    ringClassName: "border-blue-400/30",
    sources: parseSources(import.meta.env.VITE_CHANNEL_SPORTV_SOURCE_1, import.meta.env.VITE_CHANNEL_SPORTV_SOURCE_2),
  },
  {
    slug: "premiere",
    title: "Premiere",
    logoSrc: "https://s3.glbimg.com/v1/AUTH_f486c675dfaf4c6e96c25f0c21f85eb5/prod/home-share-1b75cdaa.png",
    tagline: "Futebol o dia todo",
    description: "Tudo para quem quer acompanhar futebol ao vivo e a programação do canal.",
    accentClassName: "from-[#4ade80] via-[#16a34a] to-[#15803d]",
    surfaceClassName: "from-[#07190d] via-[#0b2212] to-[#090909]",
    ringClassName: "border-green-400/30",
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
    accentClassName:
      index === 0
        ? "from-[#ffffff] via-[#d4d4d4] to-[#737373]"
        : channel.accentClassName,
  }));
}

export function getChannelDiagnostics(channel: ChannelDefinition): ChannelDiagnostic[] {
  return SOURCE_LABELS.map((label, index) => ({
    id: `source-${index + 1}`,
    label,
    configured: Boolean(channel.sources[index]),
  }));
}
