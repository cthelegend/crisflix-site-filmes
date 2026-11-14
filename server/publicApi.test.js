import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { publicApi, upstreamRequest } from "./publicApi.js";
import eventsHandler from "../api/futebol/events.js";
import channelsHandler from "../api/futebol/channels.js";
import epgHandler from "../api/futebol/epg_all.js";
afterEach(() => vi.unstubAllGlobals());
const response = () => ({ headers: {}, statusCode: 0, setHeader(key, value) { this.headers[key] = value; }, end: vi.fn() });
describe("Public API boundary", () => {
  it.each([
    "/api/tmdb?path=https://evil.test/", "/api/tmdb?path=/movie/../../authentication",
    "/api/tmdb?path=/authentication/token/new", "/api/tmdb?path=/movie/1&api_key=stolen",
    "/api/tmdb?path=/movie/1&page=1&page=2", "/api/tmdb?path=/movie/1&page=501",
    "/api/tmdb?path=/search/multi&query=" + "x".repeat(201),
  ])("rejects unrestricted proxy request %s", (url) => expect(() => upstreamRequest(url, "tmdb", "test-token")).toThrow());
  it("allows catalog/details/season without exposing token in URL", () => {
    for (const path of ["/movie/550", "/tv/1489/season/1", "/discover/movie", "/trending/all/week"]) {
      const result = upstreamRequest(`/api/tmdb?path=${path}`, "tmdb", "test-token");
      expect(new URL(result.url).hostname).toBe("api.themoviedb.org");
      expect(result.url).not.toContain("test-token");
      expect(result.headers.Authorization).toBe("Bearer test-token");
    }
  });
  it("only permits the three fixed football feeds", () => {
    expect(upstreamRequest("/api/futebol/events", "football").url).toBe("https://embedtv.cc/api/events");
    expect(() => upstreamRequest("/api/futebol/admin", "football")).toThrow();
    expect(() => upstreamRequest("/api/futebol/events?url=https://evil.test", "football")).toThrow();
  });
  it("fails closed when server token is absent", async () => {
    const res = response();
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    await publicApi({ method: "GET", url: "/api/tmdb?path=/movie/550" }, res, "tmdb", "");
    expect(res.statusCode).toBe(503); expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects writes", async () => {
    const res = response(); await publicApi({ method: "POST", url: "/api/futebol/events" }, res, "football");
    expect(res.statusCode).toBe(405);
  });
  it("rejects cross-site browser traffic before contacting provider", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const res = response();
    await publicApi({ method: "GET", url: "/api/futebol/events", headers: { "sec-fetch-site": "cross-site" } }, res, "football");
    expect(res.statusCode).toBe(403); expect(fetch).not.toHaveBeenCalled();
  });
  it("strips browser cookies and authorization; refuses redirects", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"results":[]}', { headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetch); const res = response();
    await publicApi({ method: "GET", url: "/api/tmdb?path=/movie/popular", headers: { cookie: "private", authorization: "user-session" } }, res, "tmdb", "server-token");
    const options = fetch.mock.calls[0][1];
    expect(options.headers).toEqual({ Accept: "application/json", Authorization: "Bearer server-token" });
    expect(options.redirect).toBe("error"); expect(res.statusCode).toBe(200);
  });
  it("caps upstream response size", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("x".repeat(2097153), { headers: { "Content-Type": "application/json" } })));
    const res = response(); await publicApi({ method: "GET", url: "/api/futebol/events" }, res, "football");
    expect(res.statusCode).toBe(502); expect(res.headers["Cache-Control"]).toBe("no-store");
  });
  it("hides provider errors and rejects HTML", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>secret</html>")));
    const res = response(); await publicApi({ method: "GET", url: "/api/futebol/events" }, res, "football");
    expect(res.statusCode).toBe(502); expect(res.end.mock.calls[0][0]).not.toContain("secret");
  });
  it.each([
    ["events", eventsHandler, [{ title: "Brasil x Japão" }]],
    ["channels", channelsHandler, { channels: [{ id: "sportv", name: "SporTV" }] }],
    ["epg_all", epgHandler, []],
  ])("serves the static %s route with JSON mislabeled as HTML", async (feed, handler, data) => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { headers: { "Content-Type": "text/html; charset=UTF-8" } }));
    vi.stubGlobal("fetch", fetch);
    const res = response();
    await handler({ method: "GET", url: `/api/futebol/${feed}`, headers: {} }, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("application/json; charset=utf-8");
    expect(JSON.parse(res.end.mock.calls[0][0].toString())).toEqual(data);
    expect(fetch.mock.calls[0][0]).toBe(`https://embedtv.cc/api/${feed}`);
  });
  it.each([["events", {}], ["channels", []], ["epg_all", { error: "invalid" }]])("rejects invalid JSON shape for %s", async (feed, data) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(data), { headers: { "Content-Type": "text/html" } })));
    const res = response();
    await publicApi({ method: "GET", url: `/api/futebol/${feed}` }, res, "football");
    expect(res.statusCode).toBe(502);
  });
  it("does not publicly cache search queries", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response('{"results":[]}', { headers: { "Content-Type": "application/json" } })));
    const res = response(); await publicApi({ method: "GET", url: "/api/tmdb?path=/search/multi&query=test" }, res, "tmdb", "token");
    expect(res.headers["Cache-Control"]).toBe("no-store");
  });
});
describe("Production policy", () => {
  it("blocks inline scripts, object embeds and framing the site", () => {
    const config = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
    const headers = Object.fromEntries(config.headers[0].headers.map(({ key, value }) => [key, value]));
    expect(headers["Content-Security-Policy"]).toContain("script-src 'self';");
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none';");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none';");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Content-Security-Policy"]).toContain("https://superflixapi.boats");
  });
});
