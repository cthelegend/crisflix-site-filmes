import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { from } = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase", () => ({ supabase: { from } }));
import { fetchRemoteContinueWatching, fetchUserMediaState, fetchWatchlist, saveRemoteContinueWatching, upsertUserMediaState } from "./userMedia";
afterEach(() => vi.unstubAllGlobals());
let query: Record<string, ReturnType<typeof vi.fn>>;
beforeEach(() => {
  from.mockReset();
  query = Object.fromEntries(["select", "eq", "gt", "order", "limit", "upsert", "single", "maybeSingle", "returns"].map((name) => [name, vi.fn()]));
  for (const method of Object.values(query)) method.mockReturnValue(query);
  query.returns.mockResolvedValue({ data: [], error: null });
  query.single.mockResolvedValue({ data: {}, error: null });
  query.maybeSingle.mockResolvedValue({ data: null, error: null });
  from.mockReturnValue(query);
});
const scope = { userId: "account-a", profileId: "profile-2" };
describe("Per-profile media API", () => {
  it.each(["watchlist", "history", "details"])("scopes %s reads to both account and profile", async (kind) => {
    if (kind === "watchlist") await fetchWatchlist(scope);
    else if (kind === "history") await fetchRemoteContinueWatching(scope);
    else await fetchUserMediaState(scope, "movie", 550);
    expect(query.eq).toHaveBeenCalledWith("user_id", "account-a");
    expect(query.eq).toHaveBeenCalledWith("profile_id", "profile-2");
  });
  it("keeps profile identity in the upsert payload and conflict key", async () => {
    await upsertUserMediaState(scope, { media_type: "movie", media_id: 550, title: "Film", poster_path: null, backdrop_path: null, vote_average: 8 }, { user_id: "wrong", profile_id: "wrong", progress_seconds: 100 } as never);
    expect(query.upsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: "account-a", profile_id: "profile-2", progress_seconds: 100 }), { onConflict: "user_id,profile_id,media_type,media_id" });
  });
  it.each([{ userId: "account-a", profileId: "" }, { userId: "", profileId: "profile-2" }])("refuses missing account/profile before querying", async (invalid) => {
    await expect(fetchWatchlist(invalid)).rejects.toThrow("Selecione um perfil");
    expect(from).not.toHaveBeenCalled();
  });
  it("refreshes continue-watching only after the remote write has completed", async () => {
    const dispatch = vi.fn(); vi.stubGlobal("window", { dispatchEvent: dispatch });
    let complete: (value: unknown) => void;
    query.single.mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    const saving = saveRemoteContinueWatching(scope, { id: 550, type: "movie", title: "Film", poster_path: null, backdrop_path: null, vote_average: 8, updatedAt: 1000, progressSeconds: 30 });
    expect(dispatch).not.toHaveBeenCalled();
    complete({ data: {}, error: null }); await saving;
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "continue-watching-updated" }));
  });
});
