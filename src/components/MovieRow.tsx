import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

interface MovieRowProps {
  title: string;
  fetchFn?: () => Promise<{ results: Movie[] }>;
  items?: Movie[];
  type?: "movie" | "tv";
}

const MovieRow = ({ title, fetchFn, items: initialItems, type }: MovieRowProps) => {
  const [items, setItems] = useState<Movie[]>(initialItems || []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      return;
    }

    if (!fetchFn) return;
    fetchFn().then((data) => setItems(data.results));
  }, [fetchFn, initialItems]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.82;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="mb-8 px-4 md:mb-10 md:px-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-[1.35rem]">{title}</h2>
      </div>
      <div className="group relative">
        <button
          onClick={() => scroll("left")}
          className="absolute bottom-12 left-0 top-0 z-10 hidden w-12 items-center justify-center rounded-r-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronLeft size={18} />
        </button>
        <div
          ref={scrollRef}
          className="row-mask flex gap-3 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-x-hidden"
        >
          {items.map((item) => (
            <MovieCard key={`${item.media_type || type}-${item.id}`} item={item} type={type} />
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute bottom-12 right-0 top-0 z-10 hidden w-12 items-center justify-center rounded-l-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default MovieRow;
