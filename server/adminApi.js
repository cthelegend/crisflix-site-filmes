import { scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { validateSiteContent } from "../shared/siteContent.js";
import { createAdminStore } from "./adminStore.js";
const scrypt = promisify(scryptCallback);
export async function verifyAdminPassword(password, encoded) {
  const match = /^scrypt:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(encoded || "");
  if (!match || typeof password !== "string" || password.length > 128) return false;
  const result = await scrypt(password, match[1], 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return timingSafeEqual(result, Buffer.from(match[2], "hex"));
}
export function createAdminApi(env = process.env, local = false, injectedStore) {
  let store = injectedStore;
  const getStore = () => store ||= createAdminStore(env, local);
  return async function adminApi(req, res, publicRead = false) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const send = (status, data) => { res.statusCode = status; res.end(JSON.stringify(data)); };
    try {
      if (publicRead) {
        if (req.method !== "GET") return send(405, { error: "Método não permitido." });
        const state = await getStore().read();
        // Never return draft, history, credentials or sessions to public callers.
        return send(200, { content: validateSiteContent(state.published), revision: state.revision });
      }
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      if (!["GET", "POST", "PUT"].includes(req.method)) return send(405, { error: "Método não permitido." });
      if (req.headers["sec-fetch-site"] === "cross-site") return send(403, { error: "Origem não permitida." });
      const host = req.headers.host;
      if (req.method !== "GET") {
        const origin = req.headers.origin;
        if (!origin || origin !== `${local ? "http" : "https"}://${host}` || !req.headers["content-type"]?.startsWith("application/json")) return send(403, { error: "Origem ou formato não permitido." });
      }
      if (!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.ADMIN_PASSWORD_HASH || "")) return send(503, { error: "Configure ADMIN_PASSWORD_HASH no servidor para habilitar o painel." });
      let body = {};
      if (req.method !== "GET") {
        if (Number(req.headers["content-length"] || 0) > 350000) return send(413, { error: "Conteúdo muito grande." });
        if (req.body !== undefined) {
          const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
          if (Buffer.byteLength(raw) > 350000) return send(413, { error: "Conteúdo muito grande." });
          try { body = JSON.parse(raw); } catch { return send(400, { error: "JSON inválido." }); }
        } else {
          let raw = "";
          for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 350000) return send(413, { error: "Conteúdo muito grande." }); }
          try { body = JSON.parse(raw); } catch { return send(400, { error: "JSON inválido." }); }
        }
        if (!body || typeof body !== "object" || Array.isArray(body)) return send(400, { error: "Requisição inválida." });
      }
      const cookie = (req.headers.cookie || "").split(";").map(v => v.trim()).find(v => v.startsWith("ff_admin="))?.slice(9);
      const cookieHeader = (token, maxAge) => `ff_admin=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${local ? "" : "; Secure"}`;
      if (req.method === "POST" && body.action === "login") {
        const ip = local ? req.socket?.remoteAddress || "local" : req.headers["x-vercel-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
        const bucket = createHmac("sha256", env.ADMIN_PASSWORD_HASH).update(ip).digest("hex");
        if (!await getStore().attempt(bucket)) { res.setHeader("Retry-After", "900"); return send(429, { error: "Muitas tentativas. Tente novamente em 15 minutos." }); }
        if (!await verifyAdminPassword(body.password, env.ADMIN_PASSWORD_HASH)) return send(401, { error: "Senha incorreta." });
        res.setHeader("Set-Cookie", cookieHeader(await getStore().newSession(), 8 * 3600));
        return send(200, { authenticated: true });
      }
      if (!await getStore().session(cookie)) return send(401, { error: "Entre no painel para continuar." });
      if (req.method === "GET") return send(200, { ...await getStore().read(), mode: getStore().mode });
      if (body.action === "logout" && req.method === "POST") { await getStore().logout(cookie); res.setHeader("Set-Cookie", cookieHeader("", 0)); return send(200, { authenticated: false }); }
      if ((req.method === "PUT" && body.action === "save") || (req.method === "POST" && body.action === "publish")) {
        let content;
        try { content = validateSiteContent(body.content); } catch (e) { return send(400, { error: e.message }); }
        if (!Number.isSafeInteger(body.revision) || body.revision < 0) return send(400, { error: "Revisão inválida." });
        return send(200, { ...await getStore().mutate(body.revision, content, body.action === "publish"), mode: getStore().mode });
      }
      return send(400, { error: "Ação inválida." });
    } catch (error) { return send(error.status || 503, { error: error.status === 409 ? error.message : "Painel indisponível. Confira a configuração privada e a migração do banco." }); }
  };
}
