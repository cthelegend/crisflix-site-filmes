import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Bookmark, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import MovieCard from "@/components/MovieCard";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFavorites, fetchWatchlist, UserMediaState } from "@/lib/userMedia";
import { Movie } from "@/lib/tmdb";

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

const GridSection = ({ title, icon, items, emptyText }: { title: string; icon: React.ReactNode; items: Movie[]; emptyText: string }) => (
  <section>
    <div className="mb-5 flex items-center gap-2">
      {icon}
      <h2 className="text-2xl font-semibold text-white">{title}</h2>
    </div>

    {items.length ? (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => (
          <MovieCard key={`${item.media_type}-${item.id}`} item={item} type={item.media_type as "movie" | "tv"} />
        ))}
      </div>
    ) : (
      <p className="text-sm text-white/54">{emptyText}</p>
    )}
  </section>
);

const MyListPage = () => {
  const { configured, loading, user } = useAuth();
  const [favorites, setFavorites] = useState<UserMediaState[]>([]);
  const [watchlist, setWatchlist] = useState<UserMediaState[]>([]);

  useEffect(() => {
    if (!user || !configured) return;

    Promise.all([fetchFavorites(user.id), fetchWatchlist(user.id)]).then(([nextFavorites, nextWatchlist]) => {
      setFavorites(nextFavorites);
      setWatchlist(nextWatchlist);
    });
  }, [configured, user]);

  const favoriteItems = useMemo(() => favorites.map(toMovieItem), [favorites]);
  const watchlistItems = useMemo(() => watchlist.map(toMovieItem), [watchlist]);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 pb-16 pt-24 md:px-12 md:pt-28">
        <section className="mx-auto max-w-7xl space-y-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80 md:text-sm md:tracking-[0.35em]">Biblioteca</p>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">Minha lista</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
              Reúna aqui os títulos que você quer ver depois e os seus favoritos.
            </p>
          </div>

          <GridSection
            title="Minha lista"
            icon={<Bookmark size={18} className="text-primary" />}
            items={watchlistItems}
            emptyText="Você ainda não adicionou títulos à sua lista."
          />

          <GridSection
            title="Favoritos"
            icon={<Heart size={18} className="text-primary" />}
            items={favoriteItems}
            emptyText="Você ainda não marcou nenhum favorito."
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default MyListPage;
