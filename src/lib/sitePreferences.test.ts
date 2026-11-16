import { afterEach, beforeEach, expect, it, vi } from "vitest";
let storage: Map<string, string>;
beforeEach(() => {
  vi.resetModules(); storage = new Map();
  const now = Date.now();
  storage.set("foice-filme:cookie-consent:v1", JSON.stringify({ version: 1, functional: true, decidedAt: now, expiresAt: now + 180 * 86400000 }));
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
});
afterEach(() => vi.unstubAllGlobals());

it.each(["{invalid", '"not an object"', "x".repeat(3000)])("survives invalid stored preferences", async (raw) => {
  storage.set("foice-filme:site-preferences:v1", raw);
  const prefs = await import("./sitePreferences");
  expect(prefs.getSitePreferences()).toEqual(prefs.DEFAULT_PREFERENCES);
});
it("rejects unknown destinations and invalid control values", async () => {
  const { normalizePreferences, DEFAULT_PREFERENCES } = await import("./sitePreferences");
  expect(normalizePreferences({ startPage: "https://evil.test", motion: "javascript", cardSize: "gigantic", textSize: "-1", saveData: "false", rotateHighlights: "yes" })).toEqual(DEFAULT_PREFERENCES);
});
it("persists choices and reloads them without losing independent fields", async () => {
  let prefs = await import("./sitePreferences");
  prefs.updateSitePreferences({ saveData: true, startPage: "library" });
  prefs.updateSitePreferences({ textSize: "large" });
  vi.resetModules(); prefs = await import("./sitePreferences");
  expect(prefs.getSitePreferences()).toMatchObject({ saveData: true, startPage: "library", textSize: "large", motion: "system" });
});
it("restores every preference and clears the saved override", async () => {
  const prefs = await import("./sitePreferences");
  prefs.updateSitePreferences({ motion: "reduced", rotateHighlights: false, cardSize: "comfortable", textSize: "large", saveData: true, startPage: "my-list" });
  prefs.resetSitePreferences();
  expect(prefs.getSitePreferences()).toEqual(prefs.DEFAULT_PREFERENCES);
  expect(storage.has(prefs.PREFERENCES_KEY)).toBe(false);
});
it("syncs changes made by another tab", async () => {
  const prefs = await import("./sitePreferences");
  storage.set(prefs.PREFERENCES_KEY, JSON.stringify({ motion: "reduced", saveData: true }));
  prefs.syncStoredPreferences();
  expect(prefs.getSitePreferences()).toMatchObject({ motion: "reduced", saveData: true });
});
it("still applies choices when browser storage is unavailable", async () => {
  vi.stubGlobal("localStorage", { getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); }, removeItem() { throw new Error("denied"); } });
  const prefs = await import("./sitePreferences");
  prefs.updateSitePreferences({ rotateHighlights: false });
  expect(prefs.getSitePreferences().rotateHighlights).toBe(false);
  expect(() => prefs.resetSitePreferences()).not.toThrow();
});
it("only offers a private initial destination to a signed-in visitor", async () => {
  const { preferredStartPath } = await import("./sitePreferences");
  expect(preferredStartPath("my-list", false)).toBe("/");
  expect(preferredStartPath("my-list", true)).toBe("/my-list");
  expect(preferredStartPath("library", false)).toBe("/biblioteca");
  expect(preferredStartPath("home", true)).toBe("/");
});
it("reduces catalog image sizes without rewriting player or unrelated hosts", async () => {
  const prefs = await import("./sitePreferences");
  const tmdb = await import("./tmdb");
  expect(tmdb.getImageUrl("/poster.jpg", "w500")).toContain("/w500/");
  expect(tmdb.getBackdropUrl("/backdrop.jpg")).toContain("/original/");
  prefs.updateSitePreferences({ saveData: true });
  expect(tmdb.getImageUrl("/poster.jpg", "w500")).toContain("/w185/");
  expect(tmdb.getBackdropUrl("/backdrop.jpg")).toContain("/w780/");
  expect(prefs.catalogImageUrl("https://image.tmdb.org/t/p/w500/library.jpg")).toBe("https://image.tmdb.org/t/p/w185/library.jpg");
  expect(prefs.catalogImageUrl("https://superflixapi.rest/filme/550")).toBe("https://superflixapi.rest/filme/550");
  expect(prefs.catalogImageUrl("/avatars/preset-1.svg")).toBe("/avatars/preset-1.svg");
});
