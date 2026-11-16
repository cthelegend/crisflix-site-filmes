import { afterEach, describe, expect, it, vi } from "vitest";
import { AVATAR_MAX_BYTES, prepareAvatar, safeAvatarUrl, safePlayerUrl, validateDisplayName } from "./security";
import { getContinueWatching, saveContinueWatching, validateContinueWatching } from "./continueWatching";

afterEach(() => vi.unstubAllGlobals());
describe("Player URL boundary", () => {
  it.each([
    "javascript:alert(1)", "data:text/html,test", "http://superflixapi.rest/movie/1",
    "https://superflixapi.rest.evil.test/movie/1", "https://superflixapi.rest@evil.test/",
    "https://user:pass@superflixapi.rest/", "https://embedtv.cc:8443/", "/profile",
  ])("rejects unsafe source %s", (source) => expect(safePlayerUrl(source)).toBeNull());
  it("accepts HTTPS sources and rotating EmbedTV subdomains", () => {
    expect(safePlayerUrl("https://superflixapi.rest/filme/550")).toContain("superflixapi.rest");
    expect(safePlayerUrl("https://abcdef.embedtv.cc/sportv")).toContain("abcdef.embedtv.cc");
  });
  it("enforces a per-player host list", () => expect(safePlayerUrl("https://embedtv.cc/", ["superflixapi.rest"])).toBeNull());
});
describe("Profile and avatar input", () => {
  const id = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const origin = "https://project.supabase.co";
  const own = `${origin}/storage/v1/object/public/avatars/${id}/avatar.png`;
  it("accepts own bucket URL and local presets", () => {
    expect(safeAvatarUrl(own, origin, id)).toBe(own);
    expect(safeAvatarUrl(`${own}?v=${id}`, origin, id)).toContain("?v=");
    expect(safeAvatarUrl("/avatars/preset-1.svg", origin, id)).toBe("/avatars/preset-1.svg");
  });
  it.each(["data:image/svg+xml,<svg/>", "javascript:alert(1)", "https://tracker.test/image.png", "/avatars/../../index.html"])("rejects arbitrary avatar %s", (value) => {
    expect(safeAvatarUrl(value, origin, id)).toBeNull();
  });
  it("rejects other accounts and query injection", () => {
    expect(safeAvatarUrl(own, origin, "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")).toBeNull();
    expect(safeAvatarUrl(`${own}?redirect=https://evil.test`, origin, id)).toBeNull();
  });
  it("bounds profile names without removing accents", () => {
    expect(validateDisplayName("  João  ")).toBe("João");
    for (const name of [" ", "x".repeat(81), "name\u0000"]) expect(() => validateDisplayName(name)).toThrow();
  });
  it("rejects SVG and oversized images before decoding", async () => {
    await expect(prepareAvatar(new File(["<svg onload='alert(1)'/>"], "avatar.svg", { type: "image/svg+xml" }))).rejects.toThrow();
    await expect(prepareAvatar(new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], "large.png", { type: "image/png" }))).rejects.toThrow();
  });
  it("rejects forged image MIME", async () => {
    await expect(prepareAvatar(new File(["<svg/>"], "avatar.png", { type: "image/png" }))).rejects.toThrow("formato");
  });
});
describe("Untrusted browser history", () => {
  const entry = { id: 550, type: "movie", title: "Filme", poster_path: "/safe.jpg", backdrop_path: null, vote_average: 8, updatedAt: 1000 };
  it("rejects malformed JSON shape and unsafe IDs", () => {
    expect(validateContinueWatching({ entries: [entry] })).toEqual([]);
    expect(validateContinueWatching([null, {}, { ...entry, id: Infinity }, { ...entry, type: "admin" }])).toEqual([]);
  });
  it("caps entries, text and numeric values", () => {
    const result = validateContinueWatching(Array.from({ length: 100 }, () => ({ ...entry, title: "x".repeat(1000), poster_path: "https://evil.test/", vote_average: Infinity })));
    expect(result).toHaveLength(8);
    expect(result[0].title).toHaveLength(300);
    expect(result[0].poster_path).toBeNull();
    expect(result[0].vote_average).toBe(0);
  });
  it("does not send guest history in cookies and deletes old cookie", () => {
    const values = new Map<string, string>();
    const document = { cookie: "crisflix_continue=%7Binvalid%7D" };
    vi.stubGlobal("document", document);
    vi.stubGlobal("localStorage", { getItem: (key: string) => values.get(key), setItem: (key: string, value: string) => values.set(key, value) });
    vi.stubGlobal("window", { dispatchEvent: vi.fn() });
    saveContinueWatching(entry as never);
    expect(document.cookie).toContain("Max-Age=0");
    expect(document.cookie).not.toContain("Filme");
    expect(getContinueWatching()).toHaveLength(1);
  });
  it("survives disabled browser storage", () => {
    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("localStorage", { getItem() { throw new Error("denied"); } });
    expect(() => getContinueWatching()).not.toThrow();
  });
});
