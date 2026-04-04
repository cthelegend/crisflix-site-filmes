import { Link } from "react-router-dom";
import { ChevronRight, Radio } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ChannelDefinition, getChannels } from "@/lib/channels";

const ChannelCard = ({ channel }: { channel: ChannelDefinition }) => {
  const availableSources = channel.sources.length;

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-red-500/20 bg-white/[0.04] p-5 backdrop-blur-xl transition-colors hover:border-red-400/40 hover:bg-white/[0.06]">
      <div className={`absolute inset-0 bg-gradient-to-br ${channel.surfaceClassName} opacity-95`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.28),transparent_32%)]" />
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${channel.accentClassName}`} />

      <div className="relative flex h-full flex-col">
        <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/25 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
          <img src={channel.logoSrc} alt={`Logo do canal ${channel.title}`} className="h-40 w-full object-cover" loading="lazy" />
        </div>

        <div className="mt-5">
          <h2 className="text-3xl font-semibold text-white">{channel.title}</h2>
          <p className="mt-2 text-sm text-white/54">{channel.tagline}</p>
        </div>

        <p className="mt-5 max-w-sm text-sm leading-7 text-white/66">{channel.description}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-white/46">
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2">
            {availableSources > 0 ? "Ao vivo" : "Indisponível"}
          </span>
        </div>

        <div className="mt-8">
          <Button
            asChild
            className="h-12 rounded-full border border-white bg-white px-7 text-sm font-semibold text-black transition-colors duration-200 hover:bg-black hover:text-white"
          >
            <Link to={`/watch/channel/${channel.slug}`}>
              Assistir <ChevronRight size={16} />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

const Channels = () => {
  const channels = getChannels();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-12 pt-28 md:px-12 md:pb-16 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.22),transparent_25%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.08),transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/48">Esportes ao vivo</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            Acompanhe seus canais esportivos em um só lugar.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
            Escolha um canal, abra a transmissão e selecione a melhor opção para assistir.
          </p>
        </div>
      </section>

      <main className="px-4 pb-16 md:px-12">
        <section>
          <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.34em] text-white/42">
            <Radio size={14} />
            <span>Canais esportivos</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {channels.map((channel) => (
              <ChannelCard key={channel.slug} channel={channel} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Channels;
