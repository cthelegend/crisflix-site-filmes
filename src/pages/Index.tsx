import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWatchlist, UserMediaState } from "@/lib/userMedia";
import {
  Movie,
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

const getActionMovies = () => getMoviesByGenre(28);
const getComedyMovies = () => getMoviesByGenre(35);
const getThrillerMovies = () => getMoviesByGenre(53);
const getAnimationMovies = () => getMoviesByGenre(16);
const getCrimeMovies = () => getMoviesByGenre(80);
const getSciFiTV = () => getTVByGenre(10765);
const getDramaTV = () => getTVByGenre(18);
const getMysteryTV = () => getTVByGenre(9648);

const Index = () => {
  const { activeProfile, configured, loading, user } = useAuth();
  const [watchlist, setWatchlist] = useState<UserMediaState[]>([]);

  useEffect(() => {
    if (!user || !configured) return;

    fetchWatchlist(user.id).then(setWatchlist);
  }, [configured, user]);

  const watchlistItems = useMemo(() => watchlist.map(toMovieItem), [watchlist]);

  if (!loading && user && !activeProfile) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />

      <main className="-mt-20 relative z-10 pb-16 md:-mt-24">
        <ContinueWatchingRow />
        <MovieRow title="Melhores Avaliações" fetchFn={getTopRatedMovies} type="movie" />
        <MovieRow title="Em Alta" fetchFn={getTrending} />
        {watchlistItems.length > 0 && <MovieRow title="Minha Lista" items={watchlistItems} />}
        <MovieRow title="Filmes Populares" fetchFn={getPopularMovies} type="movie" />
        <MovieRow title="Ação Sem Pausa" fetchFn={getActionMovies} type="movie" />
        <MovieRow title="Comédias para Maratonar" fetchFn={getComedyMovies} type="movie" />
        <MovieRow title="Suspense e Mistério" fetchFn={getThrillerMovies} type="movie" />
        <MovieRow title="Crime e Investigação" fetchFn={getCrimeMovies} type="movie" />
        <MovieRow title="Séries Populares" fetchFn={getPopularTV} type="tv" />
        <MovieRow title="Séries Mais Bem Avaliadas" fetchFn={getTopRatedTV} type="tv" />
        <MovieRow title="Sci-Fi e Fantasia" fetchFn={getSciFiTV} type="tv" />
        <MovieRow title="Dramas para Ver Hoje" fetchFn={getDramaTV} type="tv" />
        <MovieRow title="Séries de Mistério" fetchFn={getMysteryTV} type="tv" />
        <MovieRow title="Animações" fetchFn={getAnimationMovies} type="movie" />
        <MovieRow title="Em Cartaz" fetchFn={getNowPlayingMovies} type="movie" />
        <MovieRow title="Em Breve" fetchFn={getUpcomingMovies} type="movie" />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
