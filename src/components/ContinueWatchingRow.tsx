import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ContinueWatchingCard from "@/components/ContinueWatchingCard";
import { ContinueWatchingEntry, getContinueWatching } from "@/lib/continueWatching";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRemoteContinueWatching } from "@/lib/userMedia";

const ContinueWatchingRow = () => {
  const [items, setItems] = useState<ContinueWatchingEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const sync = async () => {
      if (user) {
        setItems(await fetchRemoteContinueWatching(user.id));
        return;
      }

      setItems(getContinueWatching());
    };

    sync();
    window.addEventListener("continue-watching-updated", sync);
    return () => window.removeEventListener("continue-watching-updated", sync);
  }, [user]);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.82;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section className="mb-5 px-4 md:mb-10 md:px-12">
      <div className="mb-3 flex items-center justify-between md:mb-4">
        <h2 className="border-l-[3px] border-primary pl-3 text-base font-semibold tracking-tight text-foreground md:text-[1.35rem]">Continuar assistindo</h2>
      </div>

      <div className="group relative">
        <button
          aria-label="Ver títulos anteriores de continuar assistindo"
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-12 z-10 hidden w-12 items-center justify-center rounded-r-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollRef} className="catalog-row row-mask flex gap-2.5 overflow-x-auto pb-3 md:gap-3 md:overflow-x-hidden md:pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <ContinueWatchingCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>

        <button
          aria-label="Ver próximos títulos de continuar assistindo"
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-12 z-10 hidden w-12 items-center justify-center rounded-l-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default ContinueWatchingRow;
