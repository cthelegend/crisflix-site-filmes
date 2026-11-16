import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createAdminStore } from "./adminStore.js";
import { defaultSiteContent } from "../shared/siteContent.js";
afterEach(() => vi.unstubAllGlobals());
describe("Production admin storage", () => {
  it("requires server credentials and never silently uses disk in production", () => {
    expect(() => createAdminStore({}, false)).toThrow();
  });
  it("normalizes an empty initial row and keeps the secret inside REST headers", async () => {
    const request = vi.fn(async () => ({ ok: true, json: async () => [{ revision: 0, draft: {}, published: {}, history: [] }] }));
    vi.stubGlobal("fetch", request);
    const store = createAdminStore({ SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test_only" });
    expect((await store.read()).published).toEqual(defaultSiteContent);
    expect(request.mock.calls[0][1].headers.apikey).toBe("sb_secret_test_only");
    expect(request.mock.calls[0][0]).not.toContain("sb_secret_test_only");
    expect(request.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
  it("uses optimistic-lock RPC, hashes session tokens and revokes by hash", async () => {
    const request = vi.fn(async () => ({ ok: true, json: async () => null })); vi.stubGlobal("fetch", request);
    const store = createAdminStore({ SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "service_test_key" });
    await expect(store.mutate(3, defaultSiteContent, true)).rejects.toHaveProperty("status", 409);
    const token = await store.newSession();
    const record = JSON.parse(request.mock.calls.at(-1)[1].body);
    expect(record.token_hash).toMatch(/^[a-f0-9]{64}$/); expect(record.token_hash).not.toBe(token);
    await store.logout(token); expect(request.mock.calls.at(-1)[0]).not.toContain(token);
    expect(request.mock.calls.at(-1)[1].method).toBe("DELETE");
    expect(await store.session("injection&select=*")).toBe(false);
  });
  it("fails closed on a database error", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 403 })));
    const store = createAdminStore({ SUPABASE_URL: "https://example.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test" });
    await expect(store.read()).rejects.toThrow(); await expect(store.attempt("key")).rejects.toThrow();
  });
  it("keeps editor tables and RPCs private for both anonymous and signed-in visitors", () => {
    const sql = readFileSync(new URL("../supabase/migrations/20261115_site_editor.sql", import.meta.url), "utf8");
    for (const name of ["site_editor", "admin_sessions", "admin_login_limits"]) expect(sql).toContain(`alter table public.${name} enable row level security`);
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).not.toMatch(/grant\s+(?:all|select|execute).*to\s+(?:anon|authenticated)/i);
    expect(sql).toContain("for update"); expect(sql).toContain("security invoker set search_path = ''");
  });
});
