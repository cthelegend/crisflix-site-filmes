import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWatchlist, UserMediaState } from "@/lib/userMedia";
import {
  Movie,
  hasPrimaryGenre,
  getMoviesByGenre,
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTopRatedTV,
  getTrending,
  getTVByGenre,
  getUpcomingMovies,
} from "@/lib/tmdb";

interface HomeRow {
  title: string;
  items: Movie[];
  type?: "movie" | "tv";
}

interface HomeRowDefinition {
  title: string;
  type?: "movie" | "tv";
  primaryGenreId?: number;
  fetchPage: (page: number) => Promise<{ results: Movie[] }>;
}

const ITEMS_PER_ROW = 16;
const PAGES_PER_SECTION = [1, 2, 3, 4, 5];
const SESSION_VARIETY_SEED = Math.floor(Date.now() / 1000 / 60 / 30);

function toMovieItem(item: UserMediaState): Movie {
  return {
    id: item.media_id,
    title: item.media_type === "movie" ? item.title : undefined,
    name: item.media_type === "tv" ? item.title : undefined,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: "",
    vote_average: item.vote_average,
    release_date: item.release_date || undefined,
    first_air_date: item.first_air_date || undefined,
    genre_ids: [],
    media_type: item.media_type,
  };
}

const homeRowDefinitions: HomeRowDefinition[] = [
  { title: "Melhores Avaliações", fetchPage: getTopRatedMovies, type: "movie" },
  { title: "Em Alta", fetchPage: getTrending },
  { title: "Filmes Populares", fetchPage: getPopularMovies, type: "movie" },
  { title: "Ação Sem Pausa", fetchPage: (page) => getMoviesByGenre(28, page), primaryGenreId: 28, type: "movie" },
  { title: "Comédias para Maratonar", fetchPage: (page) => getMoviesByGenre(35, page), primaryGenreId: 35, type: "movie" },
  { title: "Suspense e Mistério", fetchPage: (page) => getMoviesByGenre(53, page), primaryGenreId: 53, type: "movie" },
  { title: "Crime e Investigação", fetchPage: (page) => getMoviesByGenre(80, page), primaryGenreId: 80, type: "movie" },
  { title: "Séries Populares", fetchPage: getPopularTV, type: "tv" },
  { title: "Séries Mais Bem Avaliadas", fetchPage: getTopRatedTV, type: "tv" },
  { title: "Sci-Fi e Fantasia", fetchPage: (page) => getTVByGenre(10765, page), primaryGenreId: 10765, type: "tv" },
  { title: "Dramas para Ver Hoje", fetchPage: (page) => getTVByGenre(18, page), primaryGenreId: 18, type: "tv" },
  { title: "Séries de Mistério", fetchPage: (page) => getTVByGenre(9648, page), primaryGenreId: 9648, type: "tv" },
  { title: "Animações", fetchPage: (page) => getMoviesByGenre(16, page), primaryGenreId: 16, type: "movie" },
  { title: "Em Cartaz", fetchPage: getNowPlayingMovies, type: "movie" },
  { title: "Em Breve", fetchPage: getUpcomingMovies, type: "movie" },
];

function getItemKey(item: Movie, fallbackType?: "movie" | "tv") {
  return `${item.media_type || fallbackType || "movie"}-${item.id}`;
}

function getVarietyScore(item: Movie, rowTitle: string) {
  const titleScore = Array.from(rowTitle).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (item.id * 9301 + titleScore * 49297 + SESSION_VARIETY_SEED * 233) % 233280;
}

async function fetchRowPool(definition: HomeRowDefinition) {
  const pageResults = await Promise.allSettled(PAGES_PER_SECTION.map((page) => definition.fetchPage(page)));

  return pageResults.flatMap((result) => (result.status === "fulfilled" ? result.value.results : []));
}

async function buildVariedRows() {
  const seen = new Set<string>();
  const rows: HomeRow[] = [];
  const pools = await Promise.all(
    homeRowDefinitions.map(async (definition) => ({
      definition,
      pool: await fetchRowPool(definition),
    })),
  );

  for (const { definition, pool } of pools) {
    const uniqueItems: Movie[] = [];
    const rowSeen = new Set<string>();
    const sortedPool = [...pool].sort((a, b) => getVarietyScore(a, definition.title) - getVarietyScore(b, definition.title));

    for (const item of sortedPool) {
      if (!item.poster_path && !item.backdrop_path) continue;
      if (definition.primaryGenreId && !hasPrimaryGenre(item, definition.primaryGenreId)) continue;

      const key = getItemKey(item, definition.type);
      if (seen.has(key) || rowSeen.has(key)) continue;

      rowSeen.add(key);
      uniqueItems.push({ ...item, media_type: item.media_type || definition.type });

      if (uniqueItems.length >= ITEMS_PER_ROW) break;
    }

    uniqueItems.forEach((item) => seen.add(getItemKey(item, definition.type)));

    if (uniqueItems.length) {
      rows.push({ title: definition.title, items: uniqueItems, type: definition.type });
    }
  }

  return rows;
}

const Index = () => {
  const { activeProfile, configured, loading, user } = useAuth();
  const [watchlist, setWatchlist] = useState<UserMediaState[]>([]);
  const [homeRows, setHomeRows] = useState<HomeRow[]>([]);

  useEffect(() => {
    if (!user || !configured) return;

    fetchWatchlist(user.id).then(setWatchlist);
  }, [configured, user]);

  useEffect(() => {
    let cancelled = false;

    buildVariedRows()
      .then((rows) => {
        if (!cancelled) setHomeRows(rows);
      })
      .catch((error) => {
        console.error("Não foi possível montar o catálogo inicial.", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const watchlistItems = useMemo(() => watchlist.map(toMovieItem), [watchlist]);

  if (!loading && user && !activeProfile) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <OnboardingTutorial userId={user?.id} activeProfile={activeProfile} />

      <main className="-mt-20 relative z-10 pb-16 md:-mt-24">
        <ContinueWatchingRow />
        {watchlistItems.length > 0 && <MovieRow title="Minha Lista" items={watchlistItems} />}
        {homeRows.map((row) => (
          <MovieRow key={row.title} title={row.title} items={row.items} type={row.type} />
        ))}
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
