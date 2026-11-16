import { createHash, randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { defaultSiteContent } from "../shared/siteContent.js";

export function createAdminStore(env, local = false) {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  const configured = Boolean(url && key);
  if (!configured && !local) throw new Error("Configure o armazenamento administrativo no servidor.");
  const hash = v => createHash("sha256").update(v).digest("hex");
  async function rest(endpoint, method = "GET", body) {
    const headers = { apikey: key, "Content-Type": "application/json", Prefer: "return=representation" };
    if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
    const res = await fetch(`${url}/rest/v1/${endpoint}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(12000), redirect: "error" });
    if (!res.ok) throw new Error("Falha no armazenamento. Confira a migração e as variáveis privadas.");
    return res.status === 204 ? null : res.json();
  }
  // Local disk is available ONLY in the Vite development middleware, never on Vercel.
  const directory = path.resolve(".admin-local");
  const sessions = new Map(), attempts = new Map();
  let queue = Promise.resolve();
  const locked = fn => { const next = queue.then(fn); queue = next.catch(() => {}); return next; };
  const initial = () => ({ revision: 0, draft: structuredClone(defaultSiteContent), published: structuredClone(defaultSiteContent), history: [] });
  async function read() {
    if (configured) {
      const state = (await rest("site_editor?id=eq.1&select=revision,draft,published,history"))[0];
      if (!state) return initial();
      return { ...state, draft: state.draft?.version === 1 ? state.draft : structuredClone(defaultSiteContent), published: state.published?.version === 1 ? state.published : structuredClone(defaultSiteContent) };
    }
    try { return JSON.parse(await readFile(path.join(directory, "content.json"), "utf8")); }
    catch (e) { if (e.code === "ENOENT") return initial(); throw e; }
  }
  async function mutate(expected, draft, publish) {
    if (configured) {
      const result = await rest("rpc/save_site_editor", "POST", { expected_revision: expected, new_draft: draft, publish_now: publish });
      if (!result) throw Object.assign(new Error("Outra edição foi salva. Recarregue antes de continuar."), { status: 409 });
      return result;
    }
    return locked(async () => {
      const state = await read();
      if (state.revision !== expected) throw Object.assign(new Error("Outra edição foi salva. Recarregue antes de continuar."), { status: 409 });
      state.revision++; state.draft = draft;
      if (publish) { state.history = [{ at: new Date().toISOString(), content: state.published }, ...state.history].slice(0, 10); state.published = draft; }
      await mkdir(directory, { recursive: true });
      const temporary = path.join(directory, "content.pending.json");
      await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
      await rename(temporary, path.join(directory, "content.json"));
      return state;
    });
  }
  return {
    read, mutate, mode: configured ? "supabase" : "local",
    async attempt(ipKey) {
      if (configured) return rest("rpc/admin_login_attempt", "POST", { bucket_key: hash(ipKey) });
      const now = Date.now();
      for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
      const bucket = attempts.get(ipKey) || { count: 0, until: now + 15 * 60000 };
      attempts.set(ipKey, bucket); return ++bucket.count <= 8;
    },
    async newSession() {
      const token = randomBytes(32).toString("hex"), expires = new Date(Date.now() + 8 * 3600000).toISOString();
      if (configured) await rest("admin_sessions", "POST", { token_hash: hash(token), expires_at: expires });
      else sessions.set(hash(token), Date.parse(expires));
      return token;
    },
    async session(token) {
      if (!/^[a-f0-9]{64}$/.test(token || "")) return false;
      if (configured) return (await rest(`admin_sessions?token_hash=eq.${hash(token)}&expires_at=gt.${new Date().toISOString()}&select=token_hash`)).length === 1;
      return (sessions.get(hash(token)) || 0) > Date.now();
    },
    async logout(token) {
      if (!/^[a-f0-9]{64}$/.test(token || "")) return;
      if (configured) await rest(`admin_sessions?token_hash=eq.${hash(token)}`, "DELETE");
      else sessions.delete(hash(token));
    },
  };
}
