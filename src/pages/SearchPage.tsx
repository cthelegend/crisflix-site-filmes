import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "@/components/MovieCard";
import SiteFooter from "@/components/SiteFooter";
import { Movie, searchMulti } from "@/lib/tmdb";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    searchMulti(query)
      .then((data) => setResults(data.results.filter((result) => result.media_type !== "person" && result.poster_path)))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 px-4 md:px-12 pb-16">
        <h1 className="mb-4 break-words text-lg font-bold text-foreground md:mb-6 md:text-2xl">
          Resultados para: <span className="text-muted-foreground">{query}</span>
        </h1>
        {loading ? (
          <p className="text-muted-foreground">Buscando...</p>
        ) : results.length === 0 ? (
          <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
        ) : (
          <div className="media-grid animate-fade-in grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-2.5 gap-y-4 md:gap-4">
            {results.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  );
};

export default SearchPage;
