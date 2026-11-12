import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, RefreshCw, Search, Shield, Trophy } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";
import { useFootballGames } from "@/hooks/use-football-games";
import { footballSlug, formatGameCountdown, type FootballTeam } from "@/lib/football";

function Team({ team }: { team: FootballTeam }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <div className="flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
        {team.image && !failed ? <img src={team.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" onError={() => setFailed(true)} /> : <Shield size={28} strokeWidth={1.25} className="text-white/35" />}
      </div>
      <p className="line-clamp-2 min-h-[18px] text-xs font-semibold leading-[1.5] text-white/90 sm:text-sm">{team.name}</p>
    </div>
  );
}

export default function Football() {
  const { data: games = [], isPending, isFetching, isError, refetch } = useFootballGames();
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const update = () => setNow(Date.now());
    const interval = window.setInterval(() => { if (!document.hidden) update(); }, 1000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", update); };
  }, []);
  const matches = useMemo(() => games.filter((game) => (!game.endsAt || game.endsAt > now) && footballSlug(`${game.title} ${game.league}`).includes(footballSlug(query.trim()))), [games, query, now]);

  return (
    <div className="min-h-screen bg-background">
      <main aria-label="Futebol" className="flex-1 px-4 pb-12 pt-24 md:px-12 md:pt-28">
        <section aria-labelledby="games-heading" aria-busy={isFetching}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h1 id="games-heading" className="border-l-[3px] border-primary pl-3 text-base font-semibold md:text-xl">Partidas disponíveis</h1>
            <button type="button" onClick={() => void refetch()} disabled={isFetching} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-xs text-white/75 hover:bg-white/10 disabled:opacity-50"><RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />Atualizar</button>
          </div>
          <div className="relative mb-5 max-w-md"><Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" /><input aria-label="Buscar time ou campeonato" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar time ou campeonato" className="h-11 w-full rounded-full border border-white/10 bg-black/30 pl-11 pr-4 text-base text-white placeholder:text-xs placeholder:text-white/40" /></div>

          {isError && <p role="alert" className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-5 text-white/65">Não foi possível atualizar as partidas. {games.length ? "A última lista permanece disponível." : "Tente novamente pelo botão Atualizar."}</p>}
          {isPending ? <div role="status" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><span className="sr-only">Carregando partidas...</span>{[0, 1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-3xl border border-white/5 bg-white/[0.035]" />)}</div>
            : matches.length ? <div className="animate-fade-in grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {matches.map((game) => <Link key={game.slug} to={`/futebol/${game.slug}`} aria-label={`Assistir ${game.title}`} className="football-card group flex min-w-0 flex-col rounded-3xl border border-white/[0.08] bg-[#141214] p-4 transition-colors hover:border-primary/40 hover:bg-[#1c1417] sm:p-4">
                <p className="line-clamp-2 text-center text-[9px] font-medium uppercase leading-4 tracking-[0.12em] text-white/40">{game.league}</p>
                <div className="mt-3 flex items-start gap-3"><Team team={game.home} /><span aria-hidden="true" className="pt-5 text-xs font-semibold text-white/25">×</span><Team team={game.away} /></div>
                <div className="mt-auto flex min-h-9 justify-center pt-3 text-center">
                  {!game.startsAt ? <span className="text-[10px] text-white/45">Horário a confirmar</span>
                    : game.startsAt <= now ? <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-[10px] font-semibold text-red-300"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />Ao vivo</span>
                    : <span className="football-countdown inline-flex items-center gap-1.5 text-[10px] tabular-nums text-white/55"><Clock3 size={12} />Começa em {formatGameCountdown(game.startsAt, now)}</span>}
                </div>
              </Link>)}
            </div> : !isError && <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-5 py-14 text-center"><Trophy size={30} strokeWidth={1.25} className="mx-auto mb-4 text-white/25" /><h3 className="text-base font-semibold">{query.trim() ? "Nenhuma partida encontrada" : "Nenhuma partida disponível agora"}</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-white/45">{query.trim() ? "Tente outro time ou campeonato." : "Assim que uma transmissão entrar no ar, ela aparecerá aqui. A lista se atualiza automaticamente."}</p>{query.trim() && <button type="button" onClick={() => setQuery("")} className="mt-4 min-h-11 rounded-full border border-white/15 px-4 text-xs">Limpar busca</button>}</div>}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
