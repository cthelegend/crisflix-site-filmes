import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Play, Radio, Tv2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getChannelBySlug, getChannelDiagnostics, getChannelPlayerOptions } from "@/lib/channels";

const ChannelWatch = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [playerLoaded, setPlayerLoaded] = useState(false);

  const channel = useMemo(() => getChannelBySlug(slug), [slug]);
  const sourceId = searchParams.get("source");
  const playerOptions = useMemo(() => (channel ? getChannelPlayerOptions(channel) : []), [channel]);
  const diagnostics = useMemo(() => (channel ? getChannelDiagnostics(channel) : []), [channel]);
  const activePlayer = useMemo(
    () => playerOptions.find((option) => option.id === sourceId) || (playerOptions.length === 1 ? playerOptions[0] : null),
    [playerOptions, sourceId],
  );

  useEffect(() => {
    setPlayerLoaded(false);
  }, [activePlayer?.src]);

  if (!channel) {
    return <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center text-white/70">Canal nao encontrado.</div>;
  }

  const chooseSource = (id: string) => navigate(`/watch/channel/${channel.slug}?source=${id}`);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {activePlayer?.src && (
        <div className="h-full w-full overflow-auto p-4 md:p-6">
          <iframe
            key={activePlayer.src}
            src={activePlayer.src}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            frameBorder={0}
            scrolling="no"
            className="h-auto w-full max-w-full rounded-xl border-0 bg-black"
            style={{ aspectRatio: "16 / 9" }}
            onLoad={() => setPlayerLoaded(true)}
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between gap-3 p-4 md:p-6">
        <div className="pointer-events-auto flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/channels")}
            className="inline-flex items-center gap-2 rounded-full bg-black/56 px-5 py-3 text-sm text-white/88 backdrop-blur-md transition-colors hover:bg-black/72"
          >
            <ArrowLeft size={18} /> Canais
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-full bg-black/46 px-5 py-3 text-sm text-white/76 backdrop-blur-md transition-colors hover:bg-black/68"
          >
            <Tv2 size={18} /> Inicio
          </button>
        </div>
      </div>

      {!playerLoaded && activePlayer && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 md:p-6">
          <div className="pointer-events-auto flex flex-col gap-4 rounded-[2rem] bg-black/46 p-5 text-white backdrop-blur-xl md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/48">{channel.badge}</p>
              <h1 className="mt-2 text-2xl font-semibold">{channel.title}</h1>
              <p className="mt-2 text-sm text-white/55">{channel.tagline}</p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm text-white/70">
              <Play size={16} fill="currentColor" /> {activePlayer.label}
            </div>
          </div>
        </div>
      )}

      {!activePlayer && playerOptions.length > 0 && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,24,0.18),transparent_24%),linear-gradient(180deg,rgba(3,3,3,0.72),rgba(3,3,3,0.96))]">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
          <div className="relative flex min-h-full items-center justify-center px-4 py-24">
            <div className="w-full max-w-5xl">
              <div className="mx-auto max-w-2xl text-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.38em] text-white/58">
                  <Radio size={14} /> Escolha sua fonte
                </p>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-white md:text-6xl">{channel.title}</h1>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/62 md:text-base">
                  Cada canal pode ter duas fontes configuradas. Selecione uma delas para abrir o player.
                </p>
              </div>

              <div className="mt-12 grid gap-5 md:grid-cols-2">
                {playerOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => chooseSource(option.id)}
                    className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/18 hover:bg-white/[0.08]"
                  >
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${option.accentClassName}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.09),transparent_28%)] opacity-70 transition duration-300 group-hover:opacity-100" />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.32em] text-white/42">Fonte</p>
                          <h2 className="mt-3 text-3xl font-semibold text-white">{option.label}</h2>
                        </div>
                        <div className="rounded-full border border-white/12 bg-black/20 p-3 text-white/78">
                          <Play size={18} />
                        </div>
                      </div>
                      <p className="mt-5 max-w-sm text-sm leading-7 text-white/64">{option.description}</p>
                      <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">
                        Abrir player <Check size={16} className="transition duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!activePlayer && playerOptions.length === 0 && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.18),transparent_24%),linear-gradient(180deg,rgba(3,3,3,0.78),rgba(3,3,3,0.96))]">
          <div className="relative flex min-h-full items-center justify-center px-4 py-24">
            <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.34em] text-white/42">Canal indisponivel</p>
              <h1 className="mt-4 text-3xl font-semibold text-white">{channel.title}</h1>
              <p className="mt-4 text-sm leading-7 text-white/62">
                Nenhuma fonte esta configurada para este canal. Preencha as duas URLs desse canal no arquivo de ambiente.
              </p>
              <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-black/30 p-4 text-left">
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Diagnostico</p>
                <div className="mt-3 space-y-2 text-sm text-white/62">
                  {diagnostics.map((item) => (
                    <p key={item.id}>
                      {item.label}: {item.configured ? "configurada" : "ausente"}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={() => navigate("/channels")}
                  className="h-12 rounded-full border border-white bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-black hover:text-white"
                >
                  <ArrowLeft size={18} /> Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelWatch;
