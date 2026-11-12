import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { CastMember, getImageUrl } from "@/lib/tmdb";

function CastPortrait({ person }: { person: CastMember }) {
  const [failed, setFailed] = useState(false);
  const initials = person.name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0]).join("");
  return (
    <li className="cast-card min-w-0 shrink-0 snap-start">
      <div className="cast-portrait relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
        {person.profile_path && !failed ? (
          <img src={getImageUrl(person.profile_path, "w185")} alt={person.name} loading="lazy" decoding="async"
            className="h-full w-full object-cover object-top" onError={() => setFailed(true)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-white/5 to-primary/10 text-white/40">
            <UserRound size={28} strokeWidth={1.3} aria-hidden="true" />
            <span className="text-xs font-medium tracking-[0.15em]">{initials}</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
      </div>
      <p className="mt-2.5 line-clamp-2 text-xs font-semibold leading-[1.4] text-white/90 md:text-sm">{person.name}</p>
      <p className="mt-1 line-clamp-2 text-[10px] leading-[1.5] text-white/45 md:text-xs">{person.character || "Participação no elenco"}</p>
    </li>
  );
}

const CastSection = ({ cast }: { cast: CastMember[] }) => {
  const ref = useRef<HTMLUListElement>(null);
  const [canBack, setCanBack] = useState(false);
  const [canNext, setCanNext] = useState(false);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    const update = () => {
      setCanBack(row.scrollLeft > 2);
      setCanNext(row.scrollLeft + row.clientWidth < row.scrollWidth - 2);
    };
    update();
    row.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(row);
    return () => { row.removeEventListener("scroll", update); resize.disconnect(); };
  }, [cast]);
  const scroll = (direction: number) => ref.current?.scrollBy({ left: direction * ref.current.clientWidth * 0.75, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });

  return (
    <section className="cast-section mt-8 min-w-0 md:mt-10" aria-labelledby="cast-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="h-5 w-[3px] rounded-full bg-primary" aria-hidden="true" />
          <h2 id="cast-heading" className="text-lg font-semibold tracking-tight text-white md:text-2xl">Elenco</h2>
          {!!cast.length && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] tabular-nums text-white/45">{cast.length}</span>}
        </div>
        <div className="hidden gap-2 md:flex">
          <button type="button" aria-label="Ver elenco anterior" onClick={() => scroll(-1)} disabled={!canBack}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 disabled:opacity-25"><ChevronLeft size={18} /></button>
          <button type="button" aria-label="Ver próximo elenco" onClick={() => scroll(1)} disabled={!canNext}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 hover:bg-white/10 disabled:opacity-25"><ChevronRight size={18} /></button>
        </div>
      </div>
      {cast.length ? (
        <ul ref={ref} tabIndex={0} aria-label="Elenco e personagens" onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); scroll(event.key === "ArrowRight" ? 1 : -1); }
        }} className="cast-rail flex snap-x snap-proximity gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4">
          {cast.map((person) => <CastPortrait key={person.id} person={person} />)}
        </ul>
      ) : <p className="text-sm text-white/45">Elenco ainda não informado.</p>}
    </section>
  );
};

export default CastSection;
