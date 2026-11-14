import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  for (const name of ["VITE_PLAYER_DUBBED_MOVIE_TEMPLATE", "VITE_PLAYER_DUBBED_TV_TEMPLATE", "VITE_PLAYER_DUBBED_TV_EPISODE_TEMPLATE"]) vi.stubEnv(name, "");
});
afterEach(() => vi.unstubAllEnvs());

it("keeps the default dubbed movie provider without build-time configuration", async () => {
  const { getDubbedPlayerSource } = await import("./playerProviders");
  expect(getDubbedPlayerSource("movie", { tmdbId: 550, imdbId: "tt0137523" })).toBe("https://superflixapi.rest/filme/tt0137523");
  expect(getDubbedPlayerSource("movie", { tmdbId: 550 })).toBe("https://superflixapi.rest/filme/550");
});
it("keeps TV and episode defaults without build-time configuration", async () => {
  const { getDubbedPlayerSource } = await import("./playerProviders");
  expect(getDubbedPlayerSource("tv", { tmdbId: 1489 })).toBe("https://superflixapi.rest/serie/1489");
  expect(getDubbedPlayerSource("tv", { tmdbId: 1489, season: 2, episode: 3 })).toBe("https://superflixapi.rest/serie/1489/2/3");
});
it.each(["javascript:alert(1)", "https://superflixapi.rest.evil.test/{tmdbId}", "http://superflixapi.rest/filme/{tmdbId}"])("rejects unsafe configured template %s", async (value) => {
  vi.stubEnv("VITE_PLAYER_DUBBED_MOVIE_TEMPLATE", value);
  const { getDubbedPlayerSource } = await import("./playerProviders");
  expect(getDubbedPlayerSource("movie", { tmdbId: 550 })).toBeNull();
});
