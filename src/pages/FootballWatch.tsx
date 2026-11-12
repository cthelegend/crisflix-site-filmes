import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useFootballGames } from "@/hooks/use-football-games";

export default function FootballWatch() {
  const { slug } = useParams<{ slug: string }>();
  const { data: games, isPending, isError, refetch, isFetching } = useFootballGames(false);
  const [reload, setReload] = useState(0);
  const [selectedSource, setSelectedSource] = useState("");
  const game = games?.find((item) => item.slug === slug);
  const player = game?.players.find((item) => `${game.slug}:${item.id}` === selectedSource) || game?.players[0];

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-black">
      <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#120b0d] px-3 py-2 md:px-6">
        <Link to="/futebol" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 text-xs text-white/90 hover:bg-white/20"><ArrowLeft size={16} />Voltar</Link>
        <h1 className="min-w-0 flex-1 truncate text-xs font-medium text-white/75 md:text-sm">{game?.title || "Futebol ao vivo"}</h1>
        {game && <button type="button" aria-label="Recarregar transmissão" onClick={() => setReload((value) => value + 1)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"><RefreshCw size={16} /></button>}
      </header>
      {game && player && <section aria-label="Canais da partida" className="shrink-0 border-b border-white/10 bg-[#120f11] px-3 py-2 md:px-6">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{game.players.map((source) => <button key={source.id} type="button" aria-pressed={source.id === player.id} onClick={() => setSelectedSource(`${game.slug}:${source.id}`)} className={`min-h-11 shrink-0 rounded-full border px-4 text-xs font-medium ${source.id === player.id ? "border-white bg-white text-black" : "border-white/15 bg-white/5 text-white/65 hover:bg-white/10"}`}>{source.name}</button>)}</div>
        {player.program && <p className="mt-2 truncate pb-1 text-[10px] text-white/45">Agora no canal: {player.program}</p>}
      </section>}
      <div className="min-h-0 flex-1">
        {game && player ? <iframe key={`${game.slug}:${player.id}:${reload}`} src={player.url} title={`Transmissão: ${game.title} · ${player.name}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="block h-full w-full border-0 bg-black" />
          : <div className="flex h-full items-center justify-center px-6 text-center"><div>{isPending ? <p role="status" className="text-sm text-white/55">Carregando transmissão...</p> : <><h2 className="text-xl font-semibold">{isError ? "Não foi possível consultar a transmissão" : "Partida fora do ar"}</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">{isError ? "Tente atualizar ou escolha outra partida." : "Este jogo pode ter terminado ou ainda não estar disponível. Veja a lista atual de partidas."}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/futebol" className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-xs font-semibold text-black">Ver partidas</Link><button type="button" disabled={isFetching} onClick={() => void refetch()} className="min-h-11 rounded-full border border-white/20 px-5 text-xs disabled:opacity-50">Atualizar</button></div></>}</div></div>}
      </div>
    </main>
  );
}
