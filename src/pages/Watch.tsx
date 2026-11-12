import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ContinueWatchingEntry, saveContinueWatching } from "@/lib/continueWatching";
import { getDubbedPlayerSource } from "@/lib/playerProviders";
import { saveRemoteContinueWatching } from "@/lib/userMedia";
import { MovieDetails, Season, getMovieDetails, getTVDetails, getTVSeason } from "@/lib/tmdb";

const SAVE_INTERVAL_MS = 15000;
const positiveInteger = (value: string | null, fallback: number) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
};

const Watch = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialResumeSeconds = positiveInteger(searchParams.get("t"), 0);
  const season = positiveInteger(searchParams.get("s"), 1);
  const episode = positiveInteger(searchParams.get("e"), 1);
  const numericId = positiveInteger(id || null, 0);
  const isMovie = type === "filme" || type === "movie";
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [currentSeasonData, setCurrentSeasonData] = useState<Season | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const progressRef = useRef(initialResumeSeconds);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Old links with audio=subbed now open the sole dubbed player as well.
    if (!searchParams.has("audio")) return;
    const params = new URLSearchParams(searchParams);
    params.delete("audio");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setDetailsLoading(true);
    if (!numericId) { setDetailsLoading(false); return; }
    (isMovie ? getMovieDetails(numericId) : getTVDetails(numericId))
      .then((data) => { if (!cancelled) setDetails(data); })
      .catch(() => { if (!cancelled) setDetails(null); })
      .finally(() => { if (!cancelled) setDetailsLoading(false); });
    return () => { cancelled = true; };
  }, [isMovie, numericId]);

  useEffect(() => {
    let cancelled = false;
    setCurrentSeasonData(null);
    if (!isMovie && numericId) {
      getTVSeason(numericId, season)
        .then((data) => { if (!cancelled) setCurrentSeasonData(data); })
        .catch(() => { if (!cancelled) setCurrentSeasonData(null); });
    }
    return () => { cancelled = true; };
  }, [isMovie, numericId, season]);

  const runtimeMinutes = (isMovie ? details?.runtime
    : currentSeasonData?.episodes?.find((item) => item.episode_number === episode)?.runtime || details?.episode_run_time?.[0]) || 0;

  const nextEpisode = useMemo(() => {
    if (isMovie || !details?.seasons?.length || !currentSeasonData?.episodes?.length) return null;
    const followingEpisode = currentSeasonData.episodes.find((item) => item.episode_number > episode);
    if (followingEpisode) return { season, episode: followingEpisode.episode_number };
    const followingSeason = [...details.seasons].filter((item) => item.season_number > season)
      .sort((a, b) => a.season_number - b.season_number)[0];
    return followingSeason ? { season: followingSeason.season_number, episode: 1 } : null;
  }, [currentSeasonData, details?.seasons, episode, isMovie, season]);

  const currentDetails = details?.id === numericId ? details : null;

  const iframeSrc = useMemo(() => {
    if (!numericId) return "";
    const source = getDubbedPlayerSource(isMovie ? "movie" : "tv", {
      tmdbId: numericId, imdbId: currentDetails?.external_ids?.imdb_id || currentDetails?.imdb_id,
      season: isMovie ? undefined : season, episode: isMovie ? undefined : episode,
    });
    if (!source || !initialResumeSeconds) return source || "";
    const url = new URL(source, window.location.origin);
    url.searchParams.set("t", String(initialResumeSeconds));
    url.hash = `t=${initialResumeSeconds}`;
    return url.href;
  }, [currentDetails?.external_ids?.imdb_id, currentDetails?.imdb_id, episode, initialResumeSeconds, isMovie, numericId, season]);

  useEffect(() => {
    progressRef.current = initialResumeSeconds;
    setPlayerLoaded(false);
  }, [iframeSrc, initialResumeSeconds]);

  useEffect(() => {
    if (!details || details.id !== numericId || !numericId || !iframeSrc || !playerLoaded) return;
    let startedAt = Date.now();
    let visible = !document.hidden;
    const syncProgress = () => {
      const now = Date.now();
      if (visible) progressRef.current += Math.max(0, Math.floor((now - startedAt) / 1000));
      startedAt = now;
      if (runtimeMinutes) progressRef.current = Math.min(progressRef.current, runtimeMinutes * 60);
      return progressRef.current;
    };
    const persist = () => {
      const entry: ContinueWatchingEntry = {
        id: numericId, type: isMovie ? "movie" : "tv", title: details.title || details.name || "",
        poster_path: details.poster_path, backdrop_path: details.backdrop_path, vote_average: details.vote_average,
        release_date: details.release_date, first_air_date: details.first_air_date,
        season: isMovie ? undefined : season, episode: isMovie ? undefined : episode,
        progressSeconds: syncProgress(), runtimeSeconds: runtimeMinutes ? runtimeMinutes * 60 : undefined,
        nextEpisode, updatedAt: Date.now(),
      };
      saveContinueWatching(entry);
      if (user) void saveRemoteContinueWatching(user.id, entry).catch(() => undefined);
    };
    const onVisibility = () => { persist(); visible = !document.hidden; };
    const interval = window.setInterval(persist, SAVE_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", persist);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", persist);
      persist();
    };
  }, [details, episode, iframeSrc, isMovie, nextEpisode, numericId, playerLoaded, runtimeMinutes, season, user]);

  const goBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate(numericId ? `/details/${isMovie ? "movie" : "tv"}/${numericId}` : "/", { replace: true });
  };

  return (
    <main className="watch-page flex h-[100dvh] flex-col overflow-hidden bg-black">
      <header className="watch-toolbar flex min-h-14 shrink-0 items-center gap-4 border-b border-white/10 bg-[#120b0d] px-4 py-2 md:px-6">
        <button type="button" onClick={goBack} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 text-sm text-white/90 transition-colors hover:bg-white/20">
          <ArrowLeft size={18} /> Voltar
        </button>
        <p className="truncate text-sm text-white/70">{details?.title || details?.name || "Assistir"}</p>
      </header>
      <div className="min-h-0 flex-1">
        {iframeSrc ? (
          <iframe key={iframeSrc} title="Player dublado" tabIndex={0} src={iframeSrc}
            allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen
            className="block h-full w-full border-0 bg-black" onLoad={() => setPlayerLoaded(true)} />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-white">
            {detailsLoading ? <p role="status" className="text-white/65">Carregando player...</p> : (
              <div><h1 className="text-2xl font-semibold">Player indisponível</h1>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/60">Não foi possível abrir o player dublado para este título. Tente novamente mais tarde.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Watch;
