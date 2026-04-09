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
    <section className="mb-10 px-4 md:px-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-[1.35rem]">Continuar assistindo</h2>
      </div>

      <div className="group relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-12 z-10 hidden w-12 items-center justify-center rounded-r-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 md:flex"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollRef} className="flex gap-3 overflow-x-hidden pb-4 row-mask">
          {items.map((item) => (
            <ContinueWatchingCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>

        <button
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
