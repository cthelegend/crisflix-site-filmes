import { beforeEach, afterEach, expect, it, vi } from "vitest";
let storage: Map<string, string>;
beforeEach(() => {
  vi.resetModules(); storage = new Map();
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key), get length() { return storage.size; }, key: (index: number) => [...storage.keys()][index] ?? null });
  vi.stubGlobal("document", { cookie: "" });
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
});
afterEach(() => vi.unstubAllGlobals());
const progress = { id: 550, type: "movie" as const, title: "Test film", poster_path: null, backdrop_path: null, vote_average: 8, progressSeconds: 100, updatedAt: Date.now() };
it("does not persist optional records before the visitor chooses", async () => {
  const cookies = await import("./cookieConsent"); const prefs = await import("./sitePreferences"); const history = await import("./continueWatching");
  expect(cookies.canStoreFunctionalData()).toBe(false);
  prefs.updateSitePreferences({ textSize: "large" }); history.saveContinueWatching(progress);
  expect(storage.has(prefs.PREFERENCES_KEY)).toBe(false);
  expect(storage.has("foice-filme:guest-progress:v2")).toBe(false);
  expect(history.getContinueWatching()).toHaveLength(1);
});
it("acceptance saves the functional choices and history made during the visit", async () => {
  const cookies = await import("./cookieConsent"); const prefs = await import("./sitePreferences"); const history = await import("./continueWatching");
  prefs.updateSitePreferences({ textSize: "large" }); history.saveContinueWatching(progress);
  cookies.chooseCookieConsent(true);
  expect(cookies.canStoreFunctionalData()).toBe(true);
  expect(JSON.parse(storage.get(prefs.PREFERENCES_KEY)).textSize).toBe("large");
  expect(JSON.parse(storage.get("foice-filme:guest-progress:v2"))).toHaveLength(1);
});
it("revocation deletes optional records without deleting the login or selected profile", async () => {
  const cookies = await import("./cookieConsent"); cookies.chooseCookieConsent(true);
  const prefs = await import("./sitePreferences"); const history = await import("./continueWatching");
  prefs.updateSitePreferences({ saveData: true }); history.saveContinueWatching(progress);
  storage.set("sb-project-auth-token", "session"); storage.set("foice-filme:active-profile:account", "profile"); storage.set("crisflix-tutorial-account-profile", "seen");
  cookies.chooseCookieConsent(false);
  expect(storage.has(prefs.PREFERENCES_KEY)).toBe(false);
  expect(storage.has("foice-filme:guest-progress:v2")).toBe(false);
  expect(storage.has("crisflix-tutorial-account-profile")).toBe(false);
  expect(storage.get("sb-project-auth-token")).toBe("session");
  expect(storage.get("foice-filme:active-profile:account")).toBe("profile");
  history.saveContinueWatching({ ...progress, id: 551 }); prefs.updateSitePreferences({ textSize: "large" });
  expect(storage.has(prefs.PREFERENCES_KEY)).toBe(false);
  expect(storage.has("foice-filme:guest-progress:v2")).toBe(false);
});
it("does not read legacy preferences before accepting, but restores them on acceptance", async () => {
  storage.set("foice-filme:site-preferences:v1", JSON.stringify({ textSize: "large" }));
  const cookies = await import("./cookieConsent"); const prefs = await import("./sitePreferences");
  expect(prefs.getSitePreferences().textSize).toBe("standard");
  cookies.chooseCookieConsent(true);
  expect(prefs.getSitePreferences().textSize).toBe("large");
});
it("expires the choice and optional records after 180 days", async () => {
  const decidedAt = Date.now() - 181 * 86400000;
  storage.set("foice-filme:cookie-consent:v1", JSON.stringify({ version: 1, functional: true, decidedAt, expiresAt: decidedAt + 180 * 86400000 }));
  storage.set("foice-filme:guest-progress:v2", JSON.stringify([progress])); storage.set("sb-project-auth-token", "session");
  const cookies = await import("./cookieConsent");
  expect(cookies.getCookieConsent()).toBeNull();
  expect(storage.has("foice-filme:cookie-consent:v1")).toBe(false);
  expect(storage.has("foice-filme:guest-progress:v2")).toBe(false);
  expect(storage.get("sb-project-auth-token")).toBe("session");
});
it.each(["bad json", '{"version":1,"functional":"true"}', "null"])("does not accept an invalid saved choice", async (raw) => {
  storage.set("foice-filme:cookie-consent:v1", raw);
  const cookies = await import("./cookieConsent"); expect(cookies.canStoreFunctionalData()).toBe(false);
});
it("does not crash or enable functional storage when storage access is blocked", async () => {
  vi.stubGlobal("localStorage", { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } });
  const cookies = await import("./cookieConsent");
  expect(cookies.canStoreFunctionalData()).toBe(false);
  expect(() => cookies.chooseCookieConsent(false)).not.toThrow();
});
