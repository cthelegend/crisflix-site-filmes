// Only these read-only resources may be requested. Never accept an upstream URL.
export function upstreamRequest(requestUrl, kind, token) {
  if (requestUrl.length > 2048) throw new Error("Invalid request");
  const input = new URL(requestUrl, "https://local.invalid");
  if (kind === "football") {
    const match = /^\/api\/futebol\/(events|channels|epg_all)$/.exec(input.pathname);
    if (!match || input.search) throw new Error("Invalid request");
    return { url: `https://embedtv.cc/api/${match[1]}`, headers: { Accept: "application/json" } };
  }
  const endpoint = input.searchParams.get("path") || "";
  const allowed = /^\/(?:trending\/all\/week|(?:movie|tv)\/(?:popular|top_rated)|movie\/now_playing|discover\/(?:movie|tv)|search\/multi|(?:movie|tv)\/[1-9]\d{0,9}|tv\/[1-9]\d{0,9}\/season\/[1-9]\d{0,3})$/;
  if (!allowed.test(endpoint)) throw new Error("Invalid request");
  const validators = {
    path: (v) => v === endpoint,
    page: (v) => /^[1-9]\d{0,2}$/.test(v) && Number(v) <= 500,
    language: (v) => v === "pt-BR",
    query: (v) => v.trim().length > 0 && v.length <= 200,
    with_genres: (v) => /^[1-9]\d{0,4}$/.test(v),
    include_adult: (v) => v === "false",
    "primary_release_date.gte": (v) => /^\d{4}-\d{2}-\d{2}$/.test(v),
    sort_by: (v) => v === "primary_release_date.asc",
    append_to_response: (v) => v === "external_ids,credits",
  };
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  const seen = new Set();
  for (const [key, value] of input.searchParams) {
    if (!Object.hasOwn(validators, key) || seen.has(key) || !validators[key](value)) throw new Error("Invalid request");
    seen.add(key);
    if (key !== "path") url.searchParams.set(key, value);
  }
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("include_adult", "false");
  return { url: url.href, headers: { Accept: "application/json", Authorization: `Bearer ${token}` } };
}

export async function publicApi(req, res, kind, token = process.env.TMDB_READ_ACCESS_TOKEN) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const fail = (status, message) => {
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = status;
    res.end(JSON.stringify({ error: message }));
  };
  // Stops other websites from spending our upstream quota through a visitor's browser.
  // This is a browser boundary, not a replacement for a platform rate limit.
  if (req.headers?.["sec-fetch-site"] === "cross-site") return fail(403, "Origem não permitida.");
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return fail(405, "Método não permitido.");
  }
  let upstream;
  try { upstream = upstreamRequest(req.url || "", kind, token); }
  catch { return fail(400, "Consulta inválida."); }
  if (kind === "tmdb" && !token) return fail(503, "Catálogo temporariamente indisponível.");
  try {
    // Do not forward browser cookies, Authorization or redirects to the provider.
    const response = await fetch(upstream.url, {
      headers: upstream.headers, redirect: "error", signal: AbortSignal.timeout(10000),
    });
    // EmbedTV labels some JSON feeds as text/html; validate the bounded body below.
    if (!response.ok || kind !== "football" && !response.headers.get("content-type")?.includes("application/json")) {
      return fail(502, "Fonte temporariamente indisponível.");
    }
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 2 * 1024 * 1024) { await reader.cancel(); return fail(502, "Resposta inválida da fonte."); }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const data = JSON.parse(body.toString("utf8"));
    if (kind === "football") {
      const channels = new URL(upstream.url).pathname.endsWith("/channels");
      if (channels ? !data || !Array.isArray(data.channels) : !Array.isArray(data)) return fail(502, "Resposta inválida da fonte.");
    }
    // Public catalog only. Search queries are not stored in shared caches.
    const search = new URL(upstream.url).pathname.endsWith("/search/multi");
    res.setHeader("Cache-Control", search ? "no-store" : "public, max-age=0, s-maxage=60, stale-while-revalidate=60");
    res.statusCode = 200;
    res.end(req.method === "HEAD" ? undefined : body);
  } catch { return fail(502, "Não foi possível consultar a fonte agora."); }
}
