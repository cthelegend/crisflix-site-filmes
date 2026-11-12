import MovieCard from "./MovieCard";
import { buildWatchPath, ContinueWatchingEntry, getProgressRatio, toMovieCardItem } from "@/lib/continueWatching";

const ContinueWatchingCard = ({ item }: { item: ContinueWatchingEntry }) => (
  <MovieCard item={toMovieCardItem(item)} type={item.type} actionLabel={`Continuar assistindo ${item.title}`}
    href={buildWatchPath({ type: item.type, id: item.id, season: item.season, episode: item.episode, progressSeconds: item.progressSeconds })}
    progress={getProgressRatio(item)} episodeLabel={item.type === "tv" && item.season && item.episode ? `T${item.season} · E${item.episode}` : undefined} />
);

export default ContinueWatchingCard;
