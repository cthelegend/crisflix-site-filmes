import { Link } from "react-router-dom";
import { ChevronRight, Radio } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ChannelDefinition, getChannels } from "@/lib/channels";

const ChannelCard = ({ channel }: { channel: ChannelDefinition }) => {
  const availableSources = channel.sources.length;

  return (
    <article className={`group relative overflow-hidden rounded-[2rem] border bg-transparent p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.03] ${channel.ringClassName}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${channel.surfaceClassName} opacity-30`} />
      <div className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r ${channel.accentClassName}`} />
      <div className="absolute inset-0 rounded-[2rem] ring-1 ring-white/6" />

      <div className="relative flex h-full flex-col">
        <div className="rounded-[1.7rem] border border-white/10 bg-black/30 p-3">
          <div className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/40">
            <img src={channel.logoSrc} alt={`Logo do canal ${channel.title}`} className="h-36 w-full object-contain bg-black/30 p-3" loading="lazy" referrerPolicy="no-referrer" />
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${channel.accentClassName}`} />
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/42">Canal</p>
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-white">{channel.title}</h2>
          <p className="mt-2 text-sm text-white/54">{channel.tagline}</p>
        </div>

        <p className="mt-5 max-w-sm text-sm leading-7 text-white/66">{channel.description}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-white/46">
          <span className="rounded-full border border-white/10 bg-transparent px-3 py-2">
            {availableSources > 0 ? "Ao vivo" : "Indisponível"}
          </span>
        </div>

        <div className="mt-8">
          <Button
            asChild
            className="h-12 rounded-full border border-white bg-transparent px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-black"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%)]" />
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
