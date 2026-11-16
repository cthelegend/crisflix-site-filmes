import { describe, it, expect, vi } from "vitest";
import { scryptSync } from "node:crypto";
import { createAdminApi, verifyAdminPassword } from "./adminApi.js";
import { defaultSiteContent, validateSiteContent } from "../shared/siteContent.js";
const salt = "a".repeat(32);
const password = "Only-A-Test-Password-123";
const encoded = `scrypt:${salt}:${scryptSync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex")}`;
function fixture() {
  let data = { revision: 0, draft: structuredClone(defaultSiteContent), published: structuredClone(defaultSiteContent), history: [] };
  const tokens = new Set(); let attempts = 0;
  const store = {
    mode: "test", read: vi.fn(async () => structuredClone(data)), attempt: vi.fn(async () => ++attempts <= 8),
    newSession: vi.fn(async () => { const token = "b".repeat(64); tokens.add(token); return token; }),
    session: vi.fn(async token => tokens.has(token)), logout: vi.fn(async token => tokens.delete(token)),
    mutate: vi.fn(async (revision, content, publish) => {
      if (revision !== data.revision) throw Object.assign(new Error("Conflito"), { status: 409 });
      data = { ...data, revision: revision + 1, draft: content, published: publish ? content : data.published };
      return data;
    }),
  };
  const api = createAdminApi({ ADMIN_PASSWORD_HASH: encoded }, false, store);
  const request = async (method = "GET", body, extra = {}, publicRead = false) => {
    const req = { method, headers: { host: "site.test", origin: "https://site.test", "content-type": "application/json", ...extra }, body, socket: { remoteAddress: "127.0.0.1" } };
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(v) { this.body = JSON.parse(v); } };
    await api(req, res, publicRead); return res;
  };
  const login = () => request("POST", { action: "login", password });
  return { request, store, login };
}
describe("Admin security and publishing", () => {
  it("verifies salted scrypt and rejects invalid passwords/hashes", async () => {
    expect(await verifyAdminPassword(password, encoded)).toBe(true);
    expect(await verifyAdminPassword("wrong", encoded)).toBe(false);
    expect(await verifyAdminPassword({}, encoded)).toBe(false);
    expect(await verifyAdminPassword(password, "plaintext")).toBe(false);
  });
  it("denies unauthenticated reads, writes and publication", async () => {
    const f = fixture();
    for (const [method, body] of [["GET"], ["PUT", { action: "save" }], ["POST", { action: "publish" }]]) expect((await f.request(method, body)).statusCode).toBe(401);
    expect(f.store.mutate).not.toHaveBeenCalled();
  });
  it("rejects missing/cross origins and non-JSON before creating sessions", async () => {
    const f = fixture();
    for (const headers of [{ origin: "https://evil.test" }, { origin: undefined }, { "sec-fetch-site": "cross-site" }, { "content-type": "text/plain" }]) expect((await f.request("POST", { action: "login", password }, headers)).statusCode).toBe(403);
    expect(f.store.newSession).not.toHaveBeenCalled();
  });
  it("sets a protected cookie, saves drafts privately, publishes atomically and rejects stale revisions", async () => {
    const f = fixture(); const logged = await f.login();
    expect(logged.statusCode).toBe(200);
    expect(logged.headers["Set-Cookie"]).toContain("HttpOnly; SameSite=Strict");
    expect(logged.headers["Set-Cookie"]).toContain("Secure");
    const headers = { cookie: logged.headers["Set-Cookie"].split(";")[0] };
    const content = structuredClone(defaultSiteContent); content.appearance.slogan = "Uma edição";
    expect((await f.request("PUT", { action: "save", content, revision: 0 }, headers)).statusCode).toBe(200);
    const pub = await f.request("GET", undefined, {}, true);
    expect(pub.body.content.appearance.slogan).not.toBe("Uma edição");
    expect(pub.body).not.toHaveProperty("draft"); expect(pub.body).not.toHaveProperty("history");
    expect((await f.request("POST", { action: "publish", content, revision: 0 }, headers)).statusCode).toBe(409);
    expect((await f.request("POST", { action: "publish", content, revision: 1 }, headers)).statusCode).toBe(200);
    expect((await f.request("GET", undefined, {}, true)).body.content.appearance.slogan).toBe("Uma edição");
    await f.request("POST", { action: "logout" }, headers);
    expect((await f.request("GET", undefined, headers)).statusCode).toBe(401);
  });
  it("limits failed password attempts across requests", async () => {
    const f = fixture();
    for (let i = 0; i < 8; i++) expect((await f.request("POST", { action: "login", password: "wrong" })).statusCode).toBe(401);
    expect((await f.login()).statusCode).toBe(429); expect(f.store.newSession).not.toHaveBeenCalled();
  });
  it("fails closed when the server has no password hash", async () => {
    const api = createAdminApi({}, false);
    const res = { setHeader() {}, end: vi.fn() };
    await api({ method: "GET", headers: {} }, res); expect(res.statusCode).toBe(503);
  });
  it("rejects oversized payloads and invalid content before mutation", async () => {
    const f = fixture(); const log = await f.login(); const headers = { cookie: log.headers["Set-Cookie"].split(";")[0] };
    expect((await f.request("PUT", { action: "save", content: "x".repeat(360000) }, headers)).statusCode).toBe(413);
    expect((await f.request("PUT", { action: "save", content: {}, revision: 0 }, headers)).statusCode).toBe(400);
    expect(f.store.mutate).not.toHaveBeenCalled();
  });
});
describe("Editorial content boundary", () => {
  it("round trips defaults and strips unknown fields", () => expect(validateSiteContent({ ...defaultSiteContent, secret: "never" })).toEqual(defaultSiteContent));
  it.each(["javascript:alert(1)", "//evil.test", "https://user:pass@evil.test", "/\\evil.test", "http://insecure.test"])("rejects dangerous links: %s", href => {
    const c = structuredClone(defaultSiteContent); c.notices = [{ id: "n", enabled: true, title: "Aviso", message: "", href, start: "", end: "" }]; expect(() => validateSiteContent(c)).toThrow();
  });
  it("rejects oversized lists, duplicate IDs, CSS injection and invalid schedules", () => {
    const c = structuredClone(defaultSiteContent); c.themes = [{ id: "theme", name: "Tema", accent: "red;display:none", background: "#100d10", enabled: true, start: "", end: "" }]; expect(() => validateSiteContent(c)).toThrow();
    c.themes[0].accent = "#ee0011"; c.themes[0].start = "2026-12-02T00:00:00Z"; c.themes[0].end = "2026-12-01T00:00:00Z"; expect(() => validateSiteContent(c)).toThrow();
    c.themes[0].start = ""; c.themes[0].end = ""; c.themes.push({ ...c.themes[0] }); expect(() => validateSiteContent(c)).toThrow();
    c.themes = []; c.highlights = Array(13).fill({}); expect(() => validateSiteContent(c)).toThrow();
  });
});
