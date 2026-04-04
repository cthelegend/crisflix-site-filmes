import { useNavigate } from "react-router-dom";
import { buildWatchPath, ContinueWatchingEntry, getProgressRatio } from "@/lib/continueWatching";
import { formatDisplayedRating, getImageUrl } from "@/lib/tmdb";

interface ContinueWatchingCardProps {
  item: ContinueWatchingEntry;
}

const ContinueWatchingCard = ({ item }: ContinueWatchingCardProps) => {
  const navigate = useNavigate();
  const title = item.title;
  const year = (item.release_date || item.first_air_date || "").slice(0, 4);
  const progress = getProgressRatio(item);

  return (
    <article
      onClick={() =>
        navigate(
          buildWatchPath({
            type: item.type,
            id: item.id,
            season: item.season,
            episode: item.episode,
            progressSeconds: item.progressSeconds,
          }),
        )
      }
      className="group/card relative w-[152px] flex-shrink-0 cursor-pointer md:w-[208px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-[1.35rem] bg-secondary/70 shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition duration-300">
        <img
          src={getImageUrl(item.poster_path)}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover/card:brightness-[1.04]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-transparent opacity-90" />
        <div
          className="pointer-events-none absolute -inset-y-[18%] left-[-65%] w-[46%] rotate-[14deg] bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.04)_18%,rgba(255,255,255,0.28)_48%,rgba(255,255,255,0.05)_82%,transparent_100%)] opacity-0 mix-blend-screen group-hover/card:animate-shine-sweep"
        />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/75">
            <span>{year || "Catálogo"}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5c518] px-2 py-0.5 tracking-normal text-[10px] font-semibold text-black shadow-[0_8px_18px_rgba(245,197,24,0.28)]">
              <span className="rounded-[0.35rem] bg-black px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-[0.18em] text-[#f5c518]">
                IMDb
              </span>
              {formatDisplayedRating(item.vote_average)}
            </span>
          </div>

          <p className="line-clamp-2 text-sm font-medium leading-5 text-white drop-shadow">{title}</p>
          {item.type === "tv" && item.season && item.episode && (
            <p className="mt-1 text-xs text-white/58">
              T{item.season} • E{item.episode}
            </p>
          )}

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/14">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-500"
              style={{ width: `${Math.max(progress * 100, 6)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ContinueWatchingCard;
