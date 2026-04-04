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
  category: "sports" | "bbb";
  tagline: string;
  description: string;
  badge: string;
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
  "Player principal configurado para esse canal.",
  "Player alternativo para fallback ou melhor estabilidade.",
];

function parseSources(...values: Array<string | undefined>) {
  return values.map((value) => value?.trim() || "").filter(Boolean).slice(0, 2);
}

const channels: ChannelDefinition[] = [
  {
    slug: "espn",
    title: "ESPN",
    category: "sports",
    tagline: "Esportes ao vivo",
    description: "Cobertura esportiva continua com jogos, analises e programacao ao vivo.",
    badge: "Esportes",
    accentClassName: "from-[#e50914] via-[#ff7a18] to-[#f5c518]",
    surfaceClassName: "from-[#1a1a1a] via-[#121212] to-[#070707]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_ESPN_SOURCE_1, import.meta.env.VITE_CHANNEL_ESPN_SOURCE_2),
  },
  {
    slug: "espn-2",
    title: "ESPN 2",
    category: "sports",
    tagline: "Agenda estendida",
    description: "Segunda faixa esportiva para eventos simultaneos, debates e transmissoes especiais.",
    badge: "Esportes",
    accentClassName: "from-[#ef4444] via-[#f97316] to-[#facc15]",
    surfaceClassName: "from-[#191919] via-[#101010] to-[#050505]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_ESPN2_SOURCE_1, import.meta.env.VITE_CHANNEL_ESPN2_SOURCE_2),
  },
  {
    slug: "sportv",
    title: "SporTV",
    category: "sports",
    tagline: "Programacao nacional",
    description: "Canal esportivo com grade continua para eventos ao vivo e cobertura brasileira.",
    badge: "Esportes",
    accentClassName: "from-[#2563eb] via-[#06b6d4] to-[#67e8f9]",
    surfaceClassName: "from-[#121826] via-[#0b1220] to-[#060913]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_SPORTV_SOURCE_1, import.meta.env.VITE_CHANNEL_SPORTV_SOURCE_2),
  },
  {
    slug: "premiere",
    title: "Premiere",
    category: "sports",
    tagline: "Futebol 24/7",
    description: "Faixa dedicada ao futebol com programacao continua e cobertura de rodadas.",
    badge: "Esportes",
    accentClassName: "from-[#22c55e] via-[#84cc16] to-[#facc15]",
    surfaceClassName: "from-[#10190f] via-[#0a1309] to-[#050905]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_PREMIERE_SOURCE_1, import.meta.env.VITE_CHANNEL_PREMIERE_SOURCE_2),
  },
  {
    slug: "bbb-1",
    title: "BBB 1",
    category: "bbb",
    tagline: "Camera principal",
    description: "Template pronto para a primeira camera do BBB, com duas fontes escolhiveis.",
    badge: "BBB",
    accentClassName: "from-[#f5c518] via-[#ffd54a] to-[#fff0a3]",
    surfaceClassName: "from-[#2b2508] via-[#171204] to-[#090703]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_BBB_1_SOURCE_1, import.meta.env.VITE_CHANNEL_BBB_1_SOURCE_2),
  },
  {
    slug: "bbb-2",
    title: "BBB 2",
    category: "bbb",
    tagline: "Camera alternativa",
    description: "Template pronto para a segunda camera do BBB, com duas fontes escolhiveis.",
    badge: "BBB",
    accentClassName: "from-[#f59e0b] via-[#facc15] to-[#fef08a]",
    surfaceClassName: "from-[#241b08] via-[#171003] to-[#090602]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_BBB_2_SOURCE_1, import.meta.env.VITE_CHANNEL_BBB_2_SOURCE_2),
  },
  {
    slug: "bbb-3",
    title: "BBB 3",
    category: "bbb",
    tagline: "Camera casa",
    description: "Template pronto para a terceira camera do BBB, com duas fontes escolhiveis.",
    badge: "BBB",
    accentClassName: "from-[#eab308] via-[#fde047] to-[#fef9c3]",
    surfaceClassName: "from-[#241d08] via-[#171103] to-[#090702]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_BBB_3_SOURCE_1, import.meta.env.VITE_CHANNEL_BBB_3_SOURCE_2),
  },
  {
    slug: "bbb-4",
    title: "BBB 4",
    category: "bbb",
    tagline: "Camera extra",
    description: "Template pronto para a quarta camera do BBB, com duas fontes escolhiveis.",
    badge: "BBB",
    accentClassName: "from-[#d97706] via-[#facc15] to-[#fde68a]",
    surfaceClassName: "from-[#241805] via-[#160e03] to-[#080402]",
    sources: parseSources(import.meta.env.VITE_CHANNEL_BBB_4_SOURCE_1, import.meta.env.VITE_CHANNEL_BBB_4_SOURCE_2),
  },
];

export function getChannelsByCategory(category: ChannelDefinition["category"]) {
  return channels.filter((channel) => channel.category === category);
}

export function getChannelBySlug(slug?: string) {
  return channels.find((channel) => channel.slug === slug) || null;
}

export function getChannelPlayerOptions(channel: ChannelDefinition): ChannelPlayerOption[] {
  return channel.sources.map((src, index) => ({
    id: `source-${index + 1}`,
    label: SOURCE_LABELS[index] || `Fonte ${index + 1}`,
    description: SOURCE_DESCRIPTIONS[index] || "Fonte configurada para este canal.",
    src,
    accentClassName: index === 0 ? "from-[#ffffff] via-[#d4d4d4] to-[#737373]" : "from-[#e50914] via-[#f97316] to-[#f5c518]",
  }));
}

export function getChannelDiagnostics(channel: ChannelDefinition): ChannelDiagnostic[] {
  return SOURCE_LABELS.map((label, index) => ({
    id: `source-${index + 1}`,
    label,
    configured: Boolean(channel.sources[index]),
  }));
}
