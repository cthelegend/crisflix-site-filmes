import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { BookOpen, Film, ArrowUpRight, Search } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { leftLibraryCatalog, leftLibrarySources, type LibraryCategory, type LibraryEntry } from "@/lib/leftLibrary";

const categories: { value: LibraryCategory; label: string; icon: typeof Film }[] = [
  { value: "filmes", label: "Filmes", icon: Film },
  { value: "livros", label: "Livros", icon: BookOpen },
];

function LibraryCard({ entry, category }: { entry: LibraryEntry; category: LibraryCategory }) {
  const [failed, setFailed] = useState(false);
  const Icon = category === "filmes" ? Film : BookOpen;
  const internal = entry.href.startsWith("/") && !/\.(pdf|epub)(?:[?#]|$)/i.test(entry.href);
  const palette = Array.from(entry.id).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 3;
  const coverColor = ["bg-[#641923] text-[#fff0db]", "bg-[#dfcca5] text-[#39201c]", "bg-[#202024] text-[#f1dfc4]"][palette];
  const content = <>
    <span className="relative block aspect-[2/3] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#201417]">
      {entry.sourceRank && <span className="absolute left-2 top-2 z-10 rounded-md border border-white/15 bg-black/65 px-2 py-1 text-[9px] font-semibold tabular-nums text-white/85">#{entry.sourceRank}</span>}
      {entry.image && !failed ? <img src={entry.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onError={() => setFailed(true)} />
        : category === "livros" ? <span aria-hidden="true" className={`flex h-full flex-col justify-between border-l-4 border-primary/70 p-3 sm:p-4 lg:p-5 ${coverColor}`}>
          <span className="text-[7px] font-semibold uppercase leading-3 tracking-[0.16em] opacity-60 sm:text-[8px]">Biblioteca da Esquerda</span>
          <span className="my-3 line-clamp-6 text-[13px] font-semibold leading-[1.4] sm:text-base lg:text-lg">{entry.title}</span>
          <span className="border-t border-current/20 pt-3 text-[8px] font-medium uppercase leading-4 tracking-[0.08em] opacity-75 sm:text-[9px]">{entry.author}</span>
        </span>
        : <span className="flex h-full flex-col items-center justify-center gap-5 border-l-4 border-primary/60 px-4 text-center"><Icon size={28} strokeWidth={1.2} className="text-primary/75" /><span className="text-sm font-semibold leading-6 text-white/90">{entry.title}</span></span>}
    </span>
    <span className="mt-3 min-h-10 line-clamp-2 text-xs font-semibold leading-5 text-white/90 sm:text-sm">{entry.title}</span>
    {(entry.author || entry.year) && <span className="mt-1 block text-[10px] leading-5 text-white/45 sm:text-xs">{[entry.author, entry.year].filter(Boolean).join(" · ")}</span>}
    {entry.description && <span className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{entry.description}</span>}
    <span className="mt-auto inline-flex min-h-10 items-center gap-1.5 pt-2 text-[11px] font-medium text-red-300">{entry.parts ? "Escolher parte" : category === "filmes" ? "Ver filme" : "Abrir livro"}<ArrowUpRight size={13} /></span>
  </>;
  const className = "library-card flex w-full min-w-0 flex-col rounded-2xl text-left outline-offset-4 transition-opacity hover:opacity-80";
  if (entry.parts) return <Dialog>
    <DialogTrigger asChild><button type="button" aria-label={`Escolher parte de ${entry.title}`} className={className}>{content}</button></DialogTrigger>
    <DialogContent className="max-w-[calc(100vw-32px)] rounded-3xl border-white/10 bg-[#141214] p-5 text-white sm:max-w-md sm:p-6">
      <DialogHeader><DialogTitle>{entry.title}</DialogTitle><DialogDescription>Escolha a parte que deseja assistir.</DialogDescription></DialogHeader>
      <div className="mt-2 grid gap-2">{entry.parts.map((part) => <Link key={part.href} to={part.href} className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-white/85 hover:bg-white/10">{part.title}<ArrowUpRight size={15} className="shrink-0" /></Link>)}</div>
    </DialogContent>
  </Dialog>;
  return internal ? <Link to={entry.href} aria-label={`Ver ${entry.title}`} className={className}>{content}</Link>
    : <a href={entry.href} aria-label={`Ler ${entry.title}`} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, " ").trim();

export default function LeftLibrary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category: LibraryCategory = searchParams.get("tipo") === "livros" ? "livros" : "filmes";
  const entries = leftLibraryCatalog[category];
  const [query, setQuery] = useState("");
  useEffect(() => setQuery(""), [category]);
  const visibleEntries = useMemo(() => entries.filter((entry) => normalize([entry.title, entry.author, ...(entry.aliases || [])].join(" ")).includes(normalize(query.trim()))), [entries, query]);
  const source = leftLibrarySources[category];
  const reducedMotion = useReducedMotion();
  const EmptyIcon = category === "filmes" ? Film : BookOpen;

  const select = (value: LibraryCategory) => {
    if (value !== category) setSearchParams(value === "filmes" ? {} : { tipo: value }, { preventScrollReset: true });
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") next = (index + 1) % categories.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = categories.length - 1;
    else return;
    event.preventDefault();
    select(categories[next].value);
    document.getElementById(`library-tab-${categories[next].value}`)?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 px-4 pb-12 pt-24 md:px-12 md:pb-16 md:pt-28">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-4xl">Biblioteca da Esquerda</h1>
          <div role="tablist" aria-label="Tipo de acervo" className="mx-auto mt-6 flex w-fit gap-1 rounded-full border border-white/10 bg-black/35 p-1">
            {categories.map(({ value, label, icon: Icon }, index) => <button key={value} type="button" role="tab" id={`library-tab-${value}`} aria-selected={category === value} aria-controls={`library-panel-${value}`} tabIndex={category === value ? 0 : -1} onClick={() => select(value)} onKeyDown={(event) => onTabKey(event, index)} className={`inline-flex min-h-11 min-w-28 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold transition-colors sm:text-sm ${category === value ? "bg-primary text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}><Icon size={16} />{label}</button>)}
          </div>
        </header>

        {category === "filmes" && <div className="relative mx-auto mt-6 max-w-md"><Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><input type="search" aria-label="Buscar na biblioteca" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={category === "filmes" ? "Buscar filme ou diretor" : "Buscar livro ou autor"} className="h-11 w-full rounded-full border border-white/10 bg-black/25 pl-11 pr-4 text-base text-white placeholder:text-xs placeholder:text-white/40" /></div>}
        <div className="mx-auto mt-7 max-w-6xl md:mt-9">
          {category === "filmes" && source && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-white/45 sm:text-xs"><p>{query.trim() ? `${visibleEntries.length} de ${entries.length}` : entries.length} {category === "filmes" ? "filmes" : "livros"}</p><a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-sm hover:text-white/80">{source.label}<ArrowUpRight size={13} /></a></div>}
          <AnimatePresence initial={false} mode="wait">
            <m.section key={category} role="tabpanel" id={`library-panel-${category}`} aria-labelledby={`library-tab-${category}`} tabIndex={0} initial={{ opacity: reducedMotion ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: reducedMotion ? 1 : 0 }} transition={{ duration: reducedMotion ? 0 : 0.16 }} className="outline-offset-4">
              {category === "livros" ? <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] px-5 py-12 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/[0.08]"><BookOpen size={28} strokeWidth={1.3} className="text-red-300/65" /></div>
                <h2 className="text-xl font-semibold text-white/90">Em breve</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">Estamos trabalhando nessa função</p>
              </div> : visibleEntries.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">{visibleEntries.map((entry) => <LibraryCard key={entry.id} entry={entry} category={category} />)}</div>
                : <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-white/[0.07] bg-white/[0.02] px-5 py-12 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/[0.08]"><EmptyIcon size={28} strokeWidth={1.3} className="text-red-300/65" /></div>
                  <h2 className="text-base font-semibold text-white/85">{query.trim() ? "Nenhum título encontrado" : category === "filmes" ? "Nenhum filme adicionado ainda" : "Nenhum livro adicionado ainda"}</h2>
                  <p className="mt-2 text-xs leading-6 text-white/45">{query.trim() ? "Tente outro título ou autor." : "Novos títulos em breve."}</p>
                  {query.trim() && <button type="button" onClick={() => setQuery("")} className="mt-4 min-h-11 rounded-full border border-white/15 px-4 text-xs text-white/75">Limpar busca</button>}
                </div>}
            </m.section>
          </AnimatePresence>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
