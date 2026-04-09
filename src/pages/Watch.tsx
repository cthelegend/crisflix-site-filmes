import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Info, Languages, Play, SkipForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { saveContinueWatching } from "@/lib/continueWatching";
import { AudioTrack, getAvailablePlayerOptions, getPlayerDiagnostics } from "@/lib/playerProviders";
import { saveRemoteContinueWatching } from "@/lib/userMedia";
import { MovieDetails, Season, getMovieDetails, getTVDetails, getTVSeason } from "@/lib/tmdb";

const NEAR_END_THRESHOLD = 0.92;
const SAVE_INTERVAL_MS = 15000;

const Watch = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [searchParams] = useSearchParams();
  const initialResumeSeconds = Number(searchParams.get("t") || 0);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [currentSeasonData, setCurrentSeasonData] = useState<Season | null>(null);
  const [progressSeconds, setProgressSeconds] = useState(initialResumeSeconds);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioTrack | null>(() => {
    const value = searchParams.get("audio");
    return value === "dubbed" || value === "subbed" ? value : null;
  });
  const navigate = useNavigate();
  const sessionStartRef = useRef(Date.now());
  const baseProgressRef = useRef(initialResumeSeconds);
  const { user } = useAuth();

  const season = Number(searchParams.get("s") || 1);
  const episode = Number(searchParams.get("e") || 1);
  const isMovie = type === "filme" || type === "movie";
  const numericId = Number(id);

  useEffect(() => {
    if (!numericId) return;

    if (isMovie) {
      getMovieDetails(numericId).then(setDetails);
      return;
    }

    getTVDetails(numericId).then(setDetails);
    getTVSeason(numericId, season).then(setCurrentSeasonData);
  }, [isMovie, numericId, season]);

  const runtimeSeconds = useMemo(() => {
    const runtimeMinutes = isMovie
      ? details?.runtime
      : currentSeasonData?.episodes?.find((item) => item.episode_number === episode)?.runtime || details?.episode_run_time?.[0];

    return runtimeMinutes ? runtimeMinutes * 60 : 0;
  }, [currentSeasonData?.episodes, details?.episode_run_time, details?.runtime, episode, isMovie]);

  const nextEpisode = useMemo(() => {
    if (isMovie || !details?.seasons?.length || !currentSeasonData?.episodes?.length) {
      return null;
    }

    const currentSeasonEpisodes = currentSeasonData.episodes.length;
    if (episode < currentSeasonEpisodes) {
      return { season, episode: episode + 1 };
    }

    const orderedSeasons = details.seasons.filter((item) => item.season_number > 0).sort((a, b) => a.season_number - b.season_number);
    const currentIndex = orderedSeasons.findIndex((item) => item.season_number === season);
    const nextSeason = currentIndex >= 0 ? orderedSeasons[currentIndex + 1] : null;

    if (!nextSeason) return null;

    return { season: nextSeason.season_number, episode: 1 };
  }, [currentSeasonData, details?.seasons, episode, isMovie, season]);

  useEffect(() => {
    sessionStartRef.current = Date.now();
    baseProgressRef.current = initialResumeSeconds;
    setProgressSeconds(initialResumeSeconds);
    setPlayerLoaded(false);
  }, [initialResumeSeconds, numericId, season, episode]);

  useEffect(() => {
    const syncProgress = () => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const nextValue = baseProgressRef.current + Math.max(elapsed, 0);
      const bounded = runtimeSeconds ? Math.min(nextValue, runtimeSeconds) : nextValue;
      setProgressSeconds(bounded);
      return bounded;
    };

    const persist = () => {
      if (!details || !numericId) return;

      const latestProgress = syncProgress();
      const entry = {
        id: numericId,
        type: isMovie ? "movie" : "tv",
        title: details.title || details.name || "",
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        vote_average: details.vote_average,
        release_date: details.release_date,
        first_air_date: details.first_air_date,
        season: isMovie ? undefined : season,
        episode: isMovie ? undefined : episode,
        progressSeconds: latestProgress,
        runtimeSeconds: runtimeSeconds || undefined,
        nextEpisode,
        updatedAt: Date.now(),
      };

      saveContinueWatching(entry);

      if (user) {
        void saveRemoteContinueWatching(user.id, entry);
      }
    };

    const interval = window.setInterval(persist, SAVE_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.hidden) {
        persist();
      } else {
        sessionStartRef.current = Date.now();
        baseProgressRef.current = progressSeconds;
      }
    };

    const handleBeforeUnload = () => persist();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      persist();
    };
  }, [details, episode, isMovie, nextEpisode, numericId, progressSeconds, runtimeSeconds, season, user]);

  const showNextEpisode = !isMovie && nextEpisode && runtimeSeconds > 0 && progressSeconds / runtimeSeconds >= NEAR_END_THRESHOLD;

  const playerOptions = useMemo(() => {
    if (!numericId) return [];

    return getAvailablePlayerOptions(isMovie ? "movie" : "tv", {
      tmdbId: numericId,
      imdbId: details?.external_ids?.imdb_id || details?.imdb_id,
      season: isMovie ? undefined : season,
      episode: isMovie ? undefined : episode,
    });
  }, [details?.external_ids?.imdb_id, details?.imdb_id, episode, isMovie, numericId, season]);

  const playerDiagnostics = useMemo(() => {
    if (!numericId) return [];

    return getPlayerDiagnostics(isMovie ? "movie" : "tv", {
      tmdbId: numericId,
      imdbId: details?.external_ids?.imdb_id || details?.imdb_id,
      season: isMovie ? undefined : season,
      episode: isMovie ? undefined : episode,
    });
  }, [details?.external_ids?.imdb_id, details?.imdb_id, episode, isMovie, numericId, season]);

  useEffect(() => {
    if (!playerOptions.length) {
      setSelectedAudio(null);
      return;
    }

    if (selectedAudio && playerOptions.some((option) => option.audio === selectedAudio)) {
      return;
    }

    setSelectedAudio(playerOptions.length === 1 ? playerOptions[0].audio : null);
  }, [playerOptions, selectedAudio]);

  const activePlayer = useMemo(
    () => playerOptions.find((option) => option.audio === selectedAudio) || null,
    [playerOptions, selectedAudio],
  );

  const iframeSrc = useMemo(() => {
    if (!activePlayer) return "";

    return initialResumeSeconds > 0
      ? `${activePlayer.src}${activePlayer.src.includes("?") ? "&" : "?"}t=${Math.floor(initialResumeSeconds)}#t=${Math.floor(initialResumeSeconds)}`
      : activePlayer.src;
  }, [activePlayer, initialResumeSeconds]);

  const title = details?.title || details?.name || "Player";

  const chooseAudio = (audio: AudioTrack) => {
    setSelectedAudio(audio);
    setPlayerLoaded(false);

    const params = new URLSearchParams(searchParams);
    params.set("audio", audio);
    navigate(`/watch/${type}/${id}?${params.toString()}`, { replace: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {iframeSrc && (
        <div className="h-full w-full overflow-auto p-4 md:p-6">
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder={0}
            scrolling="no"
            className="h-auto w-full max-w-full rounded-xl border-0 bg-black"
            style={{ aspectRatio: "16 / 9" }}
            onLoad={() => setPlayerLoaded(true)}
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between gap-3 p-4 md:p-6">
        <div className="pointer-events-auto flex flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-black/56 px-5 py-3 text-sm text-white/88 backdrop-blur-md transition-colors hover:bg-black/72"
          >
            <ArrowLeft size={18} /> Voltar
          </button>
          <button
            onClick={() => navigate(`/details/${isMovie ? "movie" : "tv"}/${numericId}`)}
            className="inline-flex items-center gap-2 rounded-full bg-black/46 px-5 py-3 text-sm text-white/76 backdrop-blur-md transition-colors hover:bg-black/68"
          >
            <Info size={18} /> Detalhes
          </button>
        </div>
      </div>

      {!playerLoaded && activePlayer && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 md:p-6">
          <div className="pointer-events-auto flex flex-col gap-4 rounded-[2rem] bg-black/46 p-5 text-white backdrop-blur-xl md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/48">
                {isMovie ? "Filme" : `Temporada ${season} • Episódio ${episode}`}
              </p>
              <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
              {progressSeconds > 0 && (
                <p className="mt-2 text-sm text-white/55">
                  Continuando em {Math.floor(progressSeconds / 60)}:{String(progressSeconds % 60).padStart(2, "0")}
                </p>
              )}
            </div>

            {isMovie && (
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm text-white/70">
                <Play size={16} fill="currentColor" /> Assistindo agora
              </div>
            )}
          </div>
        </div>
      )}

      {!activePlayer && details && playerOptions.length > 1 && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.24),transparent_28%),linear-gradient(180deg,rgba(3,3,3,0.72),rgba(3,3,3,0.96))]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
          <div className="relative flex min-h-full items-center justify-center px-4 py-24">
            <div className="w-full max-w-5xl">
              <div className="mx-auto max-w-2xl text-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.38em] text-white/58">
                  <Sparkles size={14} /> Escolha sua experiencia
                </p>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">{title}</h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/62 md:text-base">
                  Selecione a faixa que deseja assistir. Quando so existir uma fonte valida, o player abre direto sem tela intermediaria.
                </p>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-2">
                {playerOptions.map((option) => (
                  <button
                    key={option.audio}
                    onClick={() => chooseAudio(option.audio)}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.08]"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.accentClassName}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_28%)] opacity-70 transition duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.32em] text-white/42">Player</p>
                          <h2 className="mt-3 text-3xl font-semibold text-white">{option.label}</h2>
                        </div>
                        <div className="rounded-full border border-white/12 bg-black/20 p-3 text-white/78">
                          <Languages size={18} />
                        </div>
                      </div>
                      <p className="mt-5 max-w-sm text-sm leading-7 text-white/64">{option.description}</p>
                      <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">
                        Abrir player <Check size={16} className="transition duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!activePlayer && details && playerOptions.length === 0 && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.18),transparent_24%),linear-gradient(180deg,rgba(3,3,3,0.78),rgba(3,3,3,0.96))]">
          <div className="relative flex min-h-full items-center justify-center px-4 py-24">
            <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.34em] text-white/42">Player indisponivel</p>
              <h1 className="mt-4 text-3xl font-semibold text-white">{title}</h1>
              <p className="mt-4 text-sm leading-7 text-white/62">
                Nenhuma fonte de reproducao esta configurada para este conteudo. Configure ao menos um template de URL para abrir o player.
              </p>
              <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-black/30 p-4 text-left">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Diagnostico</p>
                <div className="mt-3 space-y-2 text-sm text-white/62">
                  <p>Tipo: {isMovie ? "movie" : "tv"}</p>
                  <p>tmdbId: {numericId || "ausente"}</p>
                  <p>imdbId: {details?.external_ids?.imdb_id || details?.imdb_id || "ausente"}</p>
                  {!isMovie && <p>episodio: S{season} E{episode}</p>}
                  {playerDiagnostics.map((item) => (
                    <p key={item.audio}>
                      {item.label}: templates {item.templatesConsidered} | resolvido {item.resolvedSrc ? "sim" : "nao"}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => navigate(-1)}
                  className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90"
                >
                  <ArrowLeft size={18} /> Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {playerLoaded && showNextEpisode && nextEpisode && (
        <div className="pointer-events-none absolute bottom-4 right-4 md:bottom-6 md:right-6">
          <button
            onClick={() => navigate(`/watch/tv/${numericId}?s=${nextEpisode.season}&e=${nextEpisode.episode}`)}
            className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_12px_36px_rgba(0,0,0,0.35)] transition-colors hover:bg-white/90"
          >
            <SkipForward size={18} /> Próximo episódio
          </button>
        </div>
      )}
    </div>
  );
};

export default Watch;
