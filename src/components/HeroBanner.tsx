import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie, getBackdropUrl, getTrending } from "@/lib/tmdb";

const HeroBanner = () => {
  const [featured, setFeatured] = useState<Movie | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTrending().then((data) => {
      const items = data.results.filter((item) => item.backdrop_path);
      if (items.length) {
        setFeatured(items[Math.floor(Math.random() * Math.min(6, items.length))]);
      }
    });
  }, []);

  if (!featured) return <div className="h-[88svh] bg-background md:h-[92svh]" />;

  const isMovie = featured.media_type === "movie" || !!featured.title;
  const title = featured.title || featured.name || "";
  const year = (featured.release_date || featured.first_air_date || "").slice(0, 4);
  const type = isMovie ? "movie" : "tv";

  return (
    <section className="relative min-h-[88svh] w-full overflow-hidden md:min-h-[92svh]">
      <div
        className="absolute inset-0 scale-[1.03] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getBackdropUrl(featured.backdrop_path)})` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.14),transparent_20%),linear-gradient(180deg,rgba(0,0,0,0.24)_0%,rgba(0,0,0,0.72)_44%,rgba(0,0,0,0.94)_100%)] md:bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.16),transparent_24%),linear-gradient(90deg,rgba(0,0,0,0.92)_18%,rgba(0,0,0,0.58)_48%,rgba(0,0,0,0.35)_64%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 gradient-fade-bottom md:h-56" />

      <div className="relative z-10 flex min-h-[88svh] items-end px-4 pb-20 pt-28 md:min-h-[92svh] md:px-12 md:pb-28">
        <div className="max-w-2xl">
          <p className="mb-4 text-[11px] uppercase tracking-[0.34em] text-white/65 animate-fade-in md:text-xs md:tracking-[0.42em]">
            {isMovie ? "Filme em destaque" : "Série em destaque"} {year ? `• ${year}` : ""}
          </p>
          <h1 className="max-w-[12ch] text-4xl font-bold leading-none tracking-tight text-white text-shadow animate-slide-in sm:text-5xl md:max-w-xl md:text-7xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/78 animate-fade-in md:mt-5 md:text-base md:leading-7">
            {featured.overview}
          </p>
          <div className="mt-7 flex flex-col gap-3 animate-fade-in sm:flex-row sm:flex-wrap">
            <Button
              onClick={() => navigate(`/watch/${type}/${featured.id}`)}
              className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black hover:bg-white/90"
            >
              <Play size={18} fill="currentColor" /> Assistir agora
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/details/${type}/${featured.id}`)}
              className="h-12 rounded-full bg-white/14 px-7 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/22"
            >
              <Info size={18} /> Mais informações
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
