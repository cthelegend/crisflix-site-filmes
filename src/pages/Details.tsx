import CastSection from "@/components/CastSection";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, Calendar, Check, Clock3, ExternalLink, Play, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { buildWatchPath, getContinueWatchingItem } from "@/lib/continueWatching";
import {
  MovieDetails,
  Season,
  formatDisplayedRating,
  getBackdropUrl,
  getIMDbUrl,
  getImageUrl,
  getMovieDetails,
  getTVDetails,
  getTVSeason,
} from "@/lib/tmdb";
import { fetchUserMediaState, toggleWatchlist, UserMediaState } from "@/lib/userMedia";

const formatDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(`${date}T00:00:00`))
    : "Não informado";

const formatList = (items?: string[]) =>
  items && items.length > 0 ? items.join(", ") : "Não informado";

const formatDuration = (runtime?: number) => {
  if (!runtime) return "Não informado";
  if (runtime < 60) return `${runtime}min`;
  return `${Math.floor(runtime / 60)}h ${runtime % 60}min`;
};

const Details = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [loadError, setLoadError] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [season, setSeason] = useState<Season | null>(null);
  const [resumeItem, setResumeItem] = useState(() =>
    getContinueWatchingItem((type as "movie" | "tv") || "movie", Number(id)),
  );
  const [savedState, setSavedState] = useState<UserMediaState | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const numId = Number(id);
  const isTV = type === "tv";

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setLoadError(false);
    setOverviewExpanded(false);
    const loadDetails = async () => {
      try {
        const data = isTV ? await getTVDetails(numId) : await getMovieDetails(numId);
        if (cancelled) return;
        setDetails(data);
        if (isTV && data.seasons?.length) {
          setSelectedSeason(data.seasons.find((item) => item.season_number > 0)?.season_number || 1);
        }
      } catch { if (!cancelled) setLoadError(true); }
    };
    void loadDetails();
    setResumeItem(getContinueWatchingItem(isTV ? "tv" : "movie", numId));
    return () => { cancelled = true; };
  }, [isTV, numId]);

  useEffect(() => {
    if (isTV && details) {
      getTVSeason(numId, selectedSeason).then(setSeason).catch(() => setSeason(null));
    }
  }, [details, isTV, numId, selectedSeason]);

  useEffect(() => {
    const syncResume = () => setResumeItem(getContinueWatchingItem(isTV ? "tv" : "movie", numId));
    window.addEventListener("continue-watching-updated", syncResume);
    return () => window.removeEventListener("continue-watching-updated", syncResume);
  }, [isTV, numId]);

  useEffect(() => {
    if (!user || !numId) {
      setSavedState(null);
      return;
    }

    fetchUserMediaState(user.id, isTV ? "tv" : "movie", numId)
      .then(setSavedState)
      .catch(() => setSavedState(null));
  }, [isTV, numId, user]);

  const title = details?.title || details?.name || "";
  const year = (details?.release_date || details?.first_air_date || "").slice(0, 4);
  const runtime = details?.runtime || details?.episode_run_time?.[0];
  const imdbUrl = getIMDbUrl(details?.external_ids?.imdb_id || details?.imdb_id);

  const directors = useMemo(
    () => details?.credits?.crew?.filter((person) => person.job === "Director").map((person) => person.name) ?? [],
    [details],
  );

  const writers = useMemo(
    () =>
      details?.credits?.crew
        ?.filter((person) => ["Writer", "Screenplay", "Story", "Teleplay", "Creator"].includes(person.job || ""))
        .map((person) => person.name)
        .filter((name, index, arr) => arr.indexOf(name) === index) ?? [],
    [details],
  );

  const cast = useMemo(() => details?.credits?.cast?.slice(0, 12) ?? [], [details]);
  const seasonsList = useMemo(
    () => details?.seasons?.filter((item) => item.season_number > 0) ?? [],
    [details?.seasons],
  );

  if (!details) {
    return (
      <div className="details-page min-h-screen bg-background">
        <main className="px-4 pb-12 pt-28 md:px-12" aria-busy={!loadError}>
          {loadError ? <div className="py-14"><h1 className="text-xl font-semibold">Não foi possível carregar os detalhes</h1><p className="mt-3 text-sm text-white/55">Tente abrir este título novamente em alguns instantes.</p><Button onClick={() => navigate(-1)} className="mt-6 rounded-full">Voltar</Button></div> : <>
            <p role="status" className="sr-only">Carregando detalhes...</p>
            <div className="h-3 w-24 rounded-full bg-white/5" />
            <div className="mt-6 h-9 w-3/4 max-w-lg rounded-xl bg-white/10" />
            <div className="mt-5 h-24 max-w-xl rounded-xl bg-white/5" />
            <div className="mt-6 flex gap-3"><div className="h-11 w-32 rounded-full bg-white/10" /><div className="h-11 w-32 rounded-full bg-white/5" /></div>
            <div className="mt-12 h-44 rounded-2xl bg-white/[0.025]" />
          </>}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const handlePlay = (seasonNum?: number, episodeNum?: number) => {
    if (isTV && seasonNum && episodeNum) {
      navigate(buildWatchPath({ type: "tv", id: numId, season: seasonNum, episode: episodeNum }));
      return;
    }

    navigate(buildWatchPath({ type: "movie", id: numId }));
  };

  const handleResume = () => {
    navigate(
      buildWatchPath({
        type: isTV ? "tv" : "movie",
        id: numId,
        season: resumeItem?.season,
        episode: resumeItem?.episode,
        progressSeconds: resumeItem?.progressSeconds,
      }),
    );
  };

  const handleNextEpisode = () => {
    if (!resumeItem?.nextEpisode) return;
    navigate(
      buildWatchPath({
        type: "tv",
        id: numId,
        season: resumeItem.nextEpisode.season,
        episode: resumeItem.nextEpisode.episode,
      }),
    );
  };

  const mediaIdentity = details
    ? {
        media_type: isTV ? "tv" as const : "movie" as const,
        media_id: numId,
        title,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        vote_average: details.vote_average,
        release_date: details.release_date || null,
        first_air_date: details.first_air_date || null,
      }
    : null;

  const handleToggleWatchlist = async () => {
    if (!user || !mediaIdentity) {
      navigate("/auth");
      return;
    }

    try {
      const nextValue = !savedState?.in_watchlist;
      const next = await toggleWatchlist(user.id, mediaIdentity, nextValue);
      setSavedState(next);
      toast.success(nextValue ? "Adicionado à sua lista." : "Removido da sua lista.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar sua lista.");
    }
  };

  return (
    <div className="details-page min-h-screen animate-fade-in bg-background">

      <section className="details-hero relative min-h-0 overflow-hidden md:min-h-[90svh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackdropUrl(details.backdrop_path)})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.12),transparent_22%),linear-gradient(90deg,rgba(7,7,7,0.96)_18%,rgba(7,7,7,0.72)_42%,rgba(7,7,7,0.34)_68%,rgba(7,7,7,0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 gradient-fade-bottom" />

        <div className="relative z-10 px-4 pb-12 pt-24 md:px-12 md:pb-24 md:pt-28">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex min-h-11 items-center gap-2 text-xs md:mb-10 md:text-sm text-white/74 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} /> Voltar
          </button>

          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-end">
            <div className="hidden lg:block">
              <img
                src={getImageUrl(details.poster_path, "w500")}
                alt={title}
                className="w-full rounded-[2rem] shadow-[0_28px_90px_rgba(0,0,0,0.5)]"
              />
            </div>

            <div className="max-w-4xl">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.18em] md:mb-4 md:gap-3 md:text-[11px] md:tracking-[0.35em] text-white/60">
                <span>{isTV ? "Série" : "Filme"}</span>
                {year && <span>{year}</span>}
                <span>{details.status || "Catálogo"}</span>
              </div>

              <h1 className="text-3xl font-bold leading-[1.08] tracking-tight text-white text-shadow sm:text-4xl md:text-7xl">
                {title}
              </h1>
              {details.tagline && <p className="mt-3 text-sm italic md:mt-4 md:text-lg text-white/64">{details.tagline}</p>}

              <div className="details-badges mt-4 flex flex-wrap gap-2 text-[11px] text-white/82 md:mt-6 md:gap-3 md:text-sm">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5c518] px-4 py-2 font-semibold text-black">
                  <span className="rounded-[0.45rem] bg-black px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#f5c518]">
                    IMDb
                  </span>
                  {formatDisplayedRating(details.vote_average)}
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2">{formatDuration(runtime)}</span>
                <span className="rounded-full bg-white/10 px-4 py-2">
                  {details.genres?.slice(0, 3).map((genre) => genre.name).join(" • ")}
                </span>
              </div>

              <p id="details-synopsis" className={`mt-4 max-w-3xl text-[13px] leading-[1.7] text-white/70 md:mt-6 md:text-base ${overviewExpanded ? "" : "line-clamp-4 md:line-clamp-none"}`}>
                {details.overview || "Sinopse não informada."}
              </p>
              {details.overview?.length > 220 && <button type="button" aria-expanded={overviewExpanded} aria-controls="details-synopsis" onClick={() => setOverviewExpanded((value) => !value)} className="inline-flex min-h-11 items-center text-xs font-medium text-white/80 md:hidden">{overviewExpanded ? "Recolher sinopse" : "Ler sinopse completa"}</button>}

              <div className="details-actions mt-5 grid grid-cols-2 gap-2 md:mt-8 md:flex md:flex-wrap md:gap-3">
                <Button
                  onClick={() => handlePlay(isTV ? selectedSeason : undefined, isTV ? 1 : undefined)}
                  className="h-12 rounded-full border border-white bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-black hover:text-white"
                >
                  <Play size={18} fill="currentColor" /> Assistir
                </Button>

                {resumeItem && (
                  <Button
                    onClick={handleResume}
                    variant="secondary"
                    className="h-12 rounded-full border border-white bg-black px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
                  >
                    <Play size={18} /> Continuar assistindo
                  </Button>
                )}

                {isTV && resumeItem?.nextEpisode && (
                  <Button
                    onClick={handleNextEpisode}
                    variant="secondary"
                    className="h-12 rounded-full border border-white bg-black px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
                  >
                    <SkipForward size={18} /> Próximo episódio
                  </Button>
                )}

                {imdbUrl && (
                  <a
                    href={imdbUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center gap-2 rounded-full border border-white bg-black px-6 text-sm font-semibold text-white transition-colors duration-200 hover:border-[#f5c518] hover:bg-[#f5c518] hover:text-black"
                  >
                    Ver no IMDb <ExternalLink size={16} />
                  </a>
                )}

                <Button
                  onClick={handleToggleWatchlist}
                  variant="secondary"
                  className="col-span-2 h-12 w-[calc(50%_-_0.25rem)] justify-self-center rounded-full border border-white bg-black px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black md:w-auto"
                >
                  {savedState?.in_watchlist ? <Check size={18} /> : <BookmarkPlus size={18} />}
                  {savedState?.in_watchlist ? "Na minha lista" : "Minha lista"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="details-content relative z-10 px-4 pb-10 md:-mt-14 md:px-12 md:pb-16">
        <section className="details-facts min-w-0">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.035] p-4 md:rounded-[2rem] md:p-6">
            <div className="facts-summary flex flex-wrap items-center gap-4 text-sm text-white/76">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#f5c518] px-3 py-1.5 font-semibold text-black">
                <span className="rounded-[0.35rem] bg-black px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-[#f5c518]">
                  IMDb
                </span>
                <span>{formatDisplayedRating(details.vote_average)}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/25" />
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(details.release_date || details.first_air_date)}</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-white/25" />
              <div className="flex items-center gap-2">
                <Clock3 size={16} />
                <span>{formatDuration(runtime)}</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 md:mt-8 md:gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Direção</p>
                <p className="mt-2 text-base text-white/88">
                  {formatList(isTV ? details.created_by?.map((item) => item.name) : directors)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Roteiro</p>
                <p className="mt-2 text-base text-white/88">
                  {formatList(writers.length ? writers : details.created_by?.map((item) => item.name))}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Título original</p>
                <p className="mt-2 text-base text-white/88">
                  {details.original_title || details.original_name || "Não informado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Idioma original</p>
                <p className="mt-2 text-base text-white/88">
                  {details.original_language?.toUpperCase() || "Não informado"}
                </p>
              </div>
            </div>
          </div>

        </section>

        <CastSection cast={cast} />

        {isTV && details.seasons && (
          <section className="episodes-section mt-7 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-4 md:mt-10 md:rounded-[2.2rem] md:px-7 md:py-6">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/42">Temporadas</p>
                <h2 className="mt-1 text-lg font-semibold text-white md:mt-2 md:text-2xl">Episódios</h2>
              </div>
              <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:pb-3" style={{ scrollbarWidth: "thin" }}>
                <div className="inline-flex min-w-max gap-1 rounded-full bg-white/[0.04] p-1 md:gap-3 md:p-2">
                  {seasonsList.map((item) => (
                    <button
                      key={item.season_number}
                      onClick={() => setSelectedSeason(item.season_number)}
                      className={`min-h-11 whitespace-nowrap rounded-full px-3 py-2 text-xs md:px-5 md:py-2.5 md:text-sm font-medium transition-all ${
                        selectedSeason === item.season_number
                          ? "bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                          : "bg-transparent text-white/62 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {season?.episodes?.map((ep) => (
                <button
                  key={ep.episode_number}
                  onClick={() => handlePlay(selectedSeason, ep.episode_number)}
                  aria-label={`Assistir episódio ${ep.episode_number}: ${ep.name}`}
                  className="episode-card group grid w-full grid-cols-[80px_minmax(0,1fr)_28px] items-center gap-2.5 rounded-2xl md:gap-4 md:rounded-[1.6rem] bg-white/[0.04] p-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:grid-cols-[156px_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary md:aspect-auto md:h-24 md:rounded-[1.2rem]">
                    {ep.still_path ? (
                      <img src={getImageUrl(ep.still_path, "w300")} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/35">
                        Episódio
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.12em] text-white/42 md:text-xs md:tracking-[0.28em]">Episódio {ep.episode_number}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs font-semibold md:line-clamp-none text-white md:mt-1 md:text-base">{ep.name}</p>
                    <p className="mt-1 line-clamp-1 text-[10px] leading-4 md:line-clamp-2 text-white/50 md:mt-2 md:text-sm md:leading-6">
                      {ep.overview || "Resumo não informado."}
                    </p>
                  </div>

                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm md:h-auto md:w-auto md:px-4 md:py-2 text-white/76 transition-all duration-300 group-hover:bg-white/18 group-hover:text-white group-hover:shadow-[0_12px_28px_rgba(255,255,255,0.08)]">
                    <Play size={12} className="md:mr-2" fill="currentColor" /><span className="hidden md:inline">Assistir</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

      </main>

      <SiteFooter />
    </div>
  );
};

export default Details;
