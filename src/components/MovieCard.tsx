import { Link } from "react-router-dom";
import { useState } from "react";
import { Star } from "lucide-react";
import { Movie, formatDisplayedRating, getImageUrl } from "@/lib/tmdb";

interface MovieCardProps {
  item: Movie;
  type?: "movie" | "tv";
  href?: string;
  progress?: number;
  episodeLabel?: string;
  actionLabel?: string;
}

const MovieCard = ({ item, type, href, progress, episodeLabel, actionLabel }: MovieCardProps) => {
  const [posterReady, setPosterReady] = useState(false);
  const mediaType = type || item.media_type || (item.title ? "movie" : "tv");
  const title = item.title || item.name || "";
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const progressBar = progress !== undefined && <div className="h-1 overflow-hidden rounded-full bg-white/15 md:h-1.5"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0.06, Math.min(1, progress)) * 100}%` }} /></div>;

  return (
    <Link to={href || `/details/${mediaType}/${item.id}`} aria-label={actionLabel || `Ver detalhes de ${title}`} data-poster-ready={posterReady || undefined}
      className="media-card group/card relative block w-[112px] min-w-0 shrink-0 min-[380px]:w-[116px] sm:w-[148px] md:w-[208px]">
      <div className="media-poster relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.07] bg-secondary/70 transition-colors group-hover/card:border-white/25 md:rounded-[1.35rem]">
        <img src={getImageUrl(item.poster_path, "w342")}
          onLoad={(event) => { void event.currentTarget.decode().catch(() => undefined).then(() => setPosterReady(true)); }}
          onError={(event) => {
            const image = event.currentTarget;
            if (image.getAttribute("src") === "/placeholder.svg") { setPosterReady(true); return; }
            image.removeAttribute("srcset");
            image.src = "/placeholder.svg";
          }}
          srcSet={item.poster_path ? `${getImageUrl(item.poster_path, "w185")} 185w, ${getImageUrl(item.poster_path, "w342")} 342w, ${getImageUrl(item.poster_path, "w500")} 500w` : undefined}
          sizes="(min-width: 768px) 208px, (min-width: 640px) 148px, 116px"
          alt={title} className="h-full w-full object-cover transition-[filter] duration-200 group-hover/card:brightness-110" loading="lazy" decoding="async" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:from-black/95 md:via-black/10" />
        <span aria-label={`Avaliação ${formatDisplayedRating(item.vote_average)}`} className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-md border border-white/10 bg-black/65 px-1.5 py-1 text-[9px] font-semibold tabular-nums text-white/90 md:hidden"><Star size={9} className="fill-amber-300 text-amber-300" />{formatDisplayedRating(item.vote_average)}</span>
        <div className="absolute inset-x-0 bottom-0 hidden p-4 md:block">
          <div className="mb-2 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-white/65">
            <span>{year || "Catálogo"}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f5c518] px-2 py-1 text-[10px] font-semibold tracking-normal text-black"><span className="rounded-sm bg-black px-1 text-[8px] text-[#f5c518]">IMDb</span>{formatDisplayedRating(item.vote_average)}</span>
          </div>
          <p className="line-clamp-2 text-sm font-medium leading-5 text-white">{title}</p>
          {episodeLabel && <p className="mt-1 text-xs text-white/55">{episodeLabel}</p>}
          {progress !== undefined && <div className="mt-3">{progressBar}</div>}
        </div>
        {progress !== undefined && <div className="absolute inset-x-2 bottom-2 md:hidden">{progressBar}</div>}
      </div>
      <div className="media-caption px-0.5 pb-1 pt-2 md:hidden">
        <p className="line-clamp-2 min-h-8 text-[11px] font-medium leading-4 text-white/85">{title}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/40"><span>{episodeLabel || year || "Catálogo"}</span><span aria-hidden="true">·</span><span>{mediaType === "tv" ? "Série" : "Filme"}</span></p>
      </div>
    </Link>
  );
};

export default MovieCard;
