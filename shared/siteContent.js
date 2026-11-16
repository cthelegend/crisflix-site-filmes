// Shared boundary: the same rules apply to imports, server writes and public reads.
export const defaultSiteContent = {
  version: 1, highlights: [], notices: [], themes: [], collections: [],
  library: { custom: false, films: [], books: [], booksEnabled: false },
  appearance: { slogan: "Todas as mídias para todo povo", footerNote: "", showDefaultRows: true, heroSeconds: 5.5, patternOpacity: 1 },
};
export function validateSiteContent(value) {
  const fail = (message) => { throw new Error(message); };
  const object = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : fail("Objeto inválido.");
  const text = (v, max, required = false) => typeof v === "string" && v.length <= max && (!required || v.trim()) ? v.trim() : fail("Texto ausente ou muito longo.");
  const bool = (v) => typeof v === "boolean" ? v : fail("Opção inválida.");
  const number = (v, min, max) => Number.isFinite(v) && v >= min && v <= max ? v : fail("Número fora do limite.");
  const list = (v, max, fn) => {
    if (!Array.isArray(v) || v.length > max) fail("Quantidade de itens excedida.");
    const result = v.map(fn);
    if (new Set(result.map(i => i.id)).size !== result.length) fail("Identificadores duplicados.");
    return result;
  };
  const id = (v) => typeof v === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(v) ? v : fail("Identificador inválido.");
  const date = (v) => v === "" ? "" : typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v)) ? v : fail("Data inválida.");
  const schedule = (v) => {
    const start = date(v.start), end = date(v.end);
    if (start && end && Date.parse(start) >= Date.parse(end)) fail("O fim precisa ser posterior ao início.");
    return { start, end, enabled: bool(v.enabled) };
  };
  const link = (v) => {
    if (v === "") return "";
    if (typeof v !== "string" || v.length > 1000 || /[\\\s\u0000-\u001f]/.test(v)) fail("Link inválido.");
    if (/^\/(?!\/)/.test(v)) return v;
    try { const url = new URL(v); if (url.protocol === "https:" && !url.username && !url.password) return url.href; } catch { /* reject */ }
    return fail("Use um caminho do site ou link HTTPS.");
  };
  const image = (v) => {
    const result = link(v);
    if (!result || result.startsWith("/")) return result;
    const host = new URL(result).hostname;
    return host === "image.tmdb.org" || host.endsWith(".supabase.co") ? result : fail("Use uma imagem TMDB, Supabase ou do próprio site.");
  };
  const media = (v) => { object(v); if (!Number.isSafeInteger(v.tmdbId)) fail("ID TMDB inválido."); return { id: id(v.id), tmdbId: number(v.tmdbId, 1, 1e10), type: ["movie", "tv"].includes(v.type) ? v.type : fail("Tipo inválido."), title: text(v.title, 200, true) }; };
  const entry = (v) => { object(v); return { id: id(v.id), title: text(v.title, 200, true), href: link(v.href) || fail("Informe o link."), author: text(v.author ?? "", 200), year: text(String(v.year ?? ""), 20), description: text(v.description ?? "", 1500), image: image(v.image ?? "") }; };
  const root = object(value), appearance = object(root.appearance), library = object(root.library);
  if (root.version !== 1) fail("Versão de conteúdo inválida.");
  const color = (v) => /^#[0-9a-fA-F]{6}$/.test(v) ? v : fail("Cor inválida.");
  return {
    version: 1,
    highlights: list(root.highlights, 12, v => ({ ...media(v), enabled: bool(v.enabled), subtitle: text(v.subtitle, 500) })),
    notices: list(root.notices, 20, v => ({ id: id(v.id), title: text(v.title, 120, true), message: text(v.message, 1200), href: link(v.href), ...schedule(v) })),
    themes: list(root.themes, 12, v => ({ id: id(v.id), name: text(v.name, 80, true), accent: color(v.accent), background: color(v.background), ...schedule(v) })),
    collections: list(root.collections, 15, v => ({ id: id(v.id), title: text(v.title, 120, true), enabled: bool(v.enabled), items: list(v.items, 40, media) })),
    library: { custom: bool(library.custom), booksEnabled: bool(library.booksEnabled), films: list(library.films, 150, entry), books: list(library.books, 150, entry) },
    appearance: { slogan: text(appearance.slogan, 100, true), footerNote: text(appearance.footerNote, 300), showDefaultRows: bool(appearance.showDefaultRows), heroSeconds: number(appearance.heroSeconds, 3, 30), patternOpacity: number(appearance.patternOpacity, 0, 2) },
  };
}
