import ContinueWatchingRow from "@/components/ContinueWatchingRow";
import DisclaimerPopup from "@/components/DisclaimerPopup";
import HeroBanner from "@/components/HeroBanner";
import MovieRow from "@/components/MovieRow";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTopRatedTV,
  getTrending,
} from "@/lib/tmdb";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DisclaimerPopup />
      <Navbar />
      <HeroBanner />

      <main className="-mt-24 relative z-10 pb-16">
        <ContinueWatchingRow />
        <MovieRow title="Em Alta" fetchFn={getTrending} />
        <MovieRow title="Filmes Populares" fetchFn={getPopularMovies} type="movie" />
        <MovieRow title="Em Cartaz" fetchFn={getNowPlayingMovies} type="movie" />
        <MovieRow title="Séries Populares" fetchFn={getPopularTV} type="tv" />
        <MovieRow title="Filmes Mais Votados" fetchFn={getTopRatedMovies} type="movie" />
        <MovieRow title="Séries Mais Votadas" fetchFn={getTopRatedTV} type="tv" />
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
