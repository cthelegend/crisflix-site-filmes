import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import MovieCard from "@/components/MovieCard";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import {
  MOVIE_GENRES,
  Movie,
  TV_GENRES,
  getMoviesByPrimaryGenre,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTopRatedTV,
  getTVByPrimaryGenre,
} from "@/lib/tmdb";

const Browse = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const isMovies = category === "movies";
  const genres = isMovies ? MOVIE_GENRES : TV_GENRES;
  const selectedGenre = searchParams.get("genre");

  const title = isMovies ? "Filmes" : "Séries";
  const subtitle = isMovies
    ? "Explore por gênero, descubra novidades e encontre algo para ver agora."
    : "Navegue por categorias, sucessos e séries para maratonar em seguida.";

  const activeGenre = useMemo(
    () => genres.find((genre) => String(genre.id) === selectedGenre) || null,
    [genres, selectedGenre],
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (selectedGenre) {
          const data = isMovies
            ? await getMoviesByPrimaryGenre(Number(selectedGenre))
            : await getTVByPrimaryGenre(Number(selectedGenre));
          setItems(data.results);
          return;
        }

        const data = isMovies ? await getPopularMovies() : await getPopularTV();
        setItems(data.results);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isMovies, selectedGenre]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="browse-content px-4 pb-10 pt-24 md:px-12 md:pb-16 md:pt-28">
        <section className="rounded-2xl md:rounded-[2.5rem] bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-4 md:p-8">
          <p className="text-xs uppercase tracking-[0.36em] text-white/44">Catálogo</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-5xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 md:mt-4 md:text-sm md:leading-7 text-white/62">{subtitle}</p>

          <div className="genre-filters -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:mt-8 md:flex-wrap md:gap-3 md:overflow-visible">
            <button
              onClick={() => setSearchParams({})}
              className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[11px] md:px-4 md:text-sm transition-colors ${
                !selectedGenre ? "bg-primary text-white" : "bg-white/8 text-white/74 hover:bg-white/12"
              }`}
            >
              Em destaque
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => setSearchParams({ genre: String(genre.id) })}
                className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-3 py-2 text-[11px] md:px-4 md:text-sm transition-colors ${
                  String(genre.id) === selectedGenre ? "bg-primary text-white" : "bg-white/8 text-white/74 hover:bg-white/12"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 md:mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                {activeGenre ? "Categoria selecionada" : "Coleção principal"}
              </p>
              <h2 className="mt-1 text-lg font-semibold md:mt-2 md:text-2xl text-white">
                {activeGenre ? activeGenre.name : isMovies ? "Filmes populares" : "Séries populares"}
              </h2>
            </div>
          </div>

          {loading ? (
            <p className="text-white/54">Carregando catálogo...</p>
          ) : (
            <div className="media-grid grid grid-cols-3 gap-x-2.5 gap-y-4 sm:grid-cols-3 md:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((item) => (
                <MovieCard key={`${item.id}-${item.media_type || category}`} item={item} type={isMovies ? "movie" : "tv"} />
              ))}
            </div>
          )}
        </section>

        {!selectedGenre && (
          <section className="mt-8 grid gap-4 md:mt-14 md:gap-6 lg:grid-cols-2">
            <BrowseSideCollection
              title={isMovies ? "Mais votados" : "Mais maratonadas"}
              fetchFn={isMovies ? getTopRatedMovies : getTopRatedTV}
              type={isMovies ? "movie" : "tv"}
            />
            <BrowseSideCollection
              title={isMovies ? "Populares agora" : "Em alta agora"}
              fetchFn={isMovies ? getPopularMovies : getPopularTV}
              type={isMovies ? "movie" : "tv"}
            />
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

const BrowseSideCollection = ({
  title,
  fetchFn,
  type,
}: {
  title: string;
  fetchFn: () => Promise<{ results: Movie[] }>;
  type: "movie" | "tv";
}) => {
  const [items, setItems] = useState<Movie[]>([]);

  useEffect(() => {
    fetchFn().then((data) => setItems(data.results.slice(0, 6)));
  }, [fetchFn]);

  if (!items.length) return null;

  return (
    <div className="rounded-[2rem] bg-white/[0.03] p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="media-grid mt-4 grid grid-cols-3 gap-2.5 md:mt-5 md:gap-4">
        {items.map((item) => (
          <MovieCard key={`${title}-${item.id}`} item={item} type={type} />
        ))}
      </div>
    </div>
  );
};

export default Browse;
