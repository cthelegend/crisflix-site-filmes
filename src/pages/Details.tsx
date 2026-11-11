import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, Calendar, Check, Clock3, ExternalLink, Play, SkipForward, Users2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
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
    : "Nao informado";

const formatList = (items?: string[]) =>
  items && items.length > 0 ? items.join(", ") : "Nao informado";

const formatDuration = (runtime?: number) => {
  if (!runtime) return "Nao informado";
  if (runtime < 60) return `${runtime}min`;
  return `${Math.floor(runtime / 60)}h ${runtime % 60}min`;
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

const Details = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [details, setDetails] = useState<MovieDetails | null>(null);
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
    const loadDetails = async () => {
      const data = isTV ? await getTVDetails(numId) : await getMovieDetails(numId);
      setDetails(data);
      if (isTV && data.seasons?.length) {
        const firstPlayableSeason =
          data.seasons.find((item) => item.season_number > 0)?.season_number || 1;
        setSelectedSeason(firstPlayableSeason);
      }
    };

    loadDetails();
    setResumeItem(getContinueWatchingItem(isTV ? "tv" : "movie", numId));
  }, [isTV, numId]);

  useEffect(() => {
    if (isTV && details) {
      getTVSeason(numId, selectedSeason).then(setSeason);
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

  const cast = useMemo(() => details?.credits?.cast?.slice(0, 10) ?? [], [details]);
  const seasonsList = useMemo(
    () => details?.seasons?.filter((item) => item.season_number > 0) ?? [],
    [details?.seasons],
  );

  if (!details) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Carregando...
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-[90svh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getBackdropUrl(details.backdrop_path)})` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.12),transparent_22%),linear-gradient(90deg,rgba(7,7,7,0.96)_18%,rgba(7,7,7,0.72)_42%,rgba(7,7,7,0.34)_68%,rgba(7,7,7,0.9)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-64 gradient-fade-bottom" />

        <div className="relative z-10 px-4 pb-16 pt-28 md:px-12 md:pb-24">
          <button
            onClick={() => navigate(-1)}
            className="mb-10 inline-flex items-center gap-2 text-sm text-white/74 transition-colors hover:text-white"
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
              <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-white/60">
                <span>{isTV ? "Serie" : "Filme"}</span>
                {year && <span>{year}</span>}
                <span>{details.status || "Catalogo"}</span>
              </div>

              <h1 className="text-4xl font-bold leading-none tracking-tight text-white text-shadow md:text-7xl">
                {title}
              </h1>
              {details.tagline && <p className="mt-4 text-lg italic text-white/64">{details.tagline}</p>}

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/82">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f5c518] px-4 py-2 font-semibold text-black">
                  <span className="rounded-[0.45rem] bg-black px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[#f5c518]">
                    IMDb
                  </span>
                  {formatDisplayedRating(details.vote_average)}
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">{formatDuration(runtime)}</span>
                <span className="rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                  {details.genres?.slice(0, 3).map((genre) => genre.name).join(" • ")}
                </span>
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-white/76 md:text-base">
                {details.overview || "Sinopse nao informada."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
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
                  className="h-12 rounded-full border border-white bg-black px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
                >
                  {savedState?.in_watchlist ? <Check size={18} /> : <BookmarkPlus size={18} />}
                  {savedState?.in_watchlist ? "Na minha lista" : "Minha lista"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="-mt-14 relative z-10 px-4 pb-16 md:px-12">
        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] bg-white/[0.045] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/76">
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

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Direcao</p>
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
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Titulo original</p>
                <p className="mt-2 text-base text-white/88">
                  {details.original_title || details.original_name || "Nao informado"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/42">Idioma original</p>
                <p className="mt-2 text-base text-white/88">
                  {details.original_language?.toUpperCase() || "Nao informado"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/[0.03] p-6">
            <div className="flex items-center gap-2">
              <Users2 size={18} className="text-primary" />
              <h2 className="text-xl font-semibold text-white">Elenco principal</h2>
            </div>
            <div className="mt-6 space-y-4">
              {cast.slice(0, 6).map((person) => (
                <div key={person.id} className="flex items-start justify-between gap-4 border-b border-white/6 pb-4 last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{person.name}</p>
                    <p className="mt-1 text-sm text-white/52">{person.character || "Personagem nao informado"}</p>
                  </div>
                  {person.profile_path ? (
                    <img
                      src={getImageUrl(person.profile_path, "w185")}
                      alt={person.name}
                      className="h-12 w-12 flex-shrink-0 rounded-full object-cover ring-1 ring-white/10"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase tracking-[0.14em] text-white/72 ring-1 ring-white/10">
                      {getInitials(person.name)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {isTV && details.seasons && (
          <section className="mt-10 rounded-[2.2rem] bg-white/[0.035] px-5 py-6 md:px-7">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/42">Temporadas</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Episodios</h2>
              </div>
              <div className="overflow-x-auto pb-3" style={{ scrollbarWidth: "thin" }}>
                <div className="inline-flex min-w-max gap-3 rounded-full bg-white/[0.04] p-2">
                  {seasonsList.map((item) => (
                    <button
                      key={item.season_number}
                      onClick={() => setSelectedSeason(item.season_number)}
                      className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
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
                  className="group grid w-full gap-4 rounded-[1.6rem] bg-white/[0.04] p-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)] md:grid-cols-[156px_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="relative h-24 overflow-hidden rounded-[1.2rem] bg-secondary">
                    {ep.still_path ? (
                      <img src={getImageUrl(ep.still_path, "w300")} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/35">
                        Episodio
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/42">Episodio {ep.episode_number}</p>
                    <p className="mt-1 text-base font-medium text-white">{ep.name}</p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/56">
                      {ep.overview || "Resumo nao informado."}
                    </p>
                  </div>

                  <div className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/76 transition-all duration-300 group-hover:bg-white/18 group-hover:text-white group-hover:shadow-[0_12px_28px_rgba(255,255,255,0.08)]">
                    <Play size={14} className="mr-2" fill="currentColor" /> Assistir
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
