import { Link } from "react-router-dom";
import { Activity, Camera, ChevronRight, Radio, Trophy, Tv2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ChannelDefinition, getChannelsByCategory } from "@/lib/channels";

const channelIcons = {
  sports: [Trophy, Radio, Activity, Tv2],
  bbb: [Camera, Camera, Camera, Camera],
};

const ChannelCard = ({ channel, index }: { channel: ChannelDefinition; index: number }) => {
  const Icon = channelIcons[channel.category][index % channelIcons[channel.category].length];
  const availableSources = channel.sources.length;

  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <div className={`absolute inset-0 bg-gradient-to-br ${channel.surfaceClassName} opacity-90`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_30%)]" />
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${channel.accentClassName}`} />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/48">{channel.badge}</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">{channel.title}</h2>
            <p className="mt-2 text-sm text-white/54">{channel.tagline}</p>
          </div>
          <div className="rounded-full border border-white/12 bg-black/28 p-3 text-white/78">
            <Icon size={18} />
          </div>
        </div>

        <p className="mt-6 max-w-sm text-sm leading-7 text-white/66">{channel.description}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs uppercase tracking-[0.24em] text-white/46">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">{availableSources}/2 fontes</span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Selecao manual</span>
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
  const sportsChannels = getChannelsByCategory("sports");
  const bbbChannels = getChannelsByCategory("bbb");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden px-4 pb-12 pt-28 md:px-12 md:pb-16 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,197,24,0.12),transparent_25%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.08),transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/48">Ao vivo</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white md:text-6xl">
            Canais com duas fontes por player e configuracao via env.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/62 md:text-base">
            A home continua dedicada a filmes e series. Esta area concentra canais esportivos e os quatro templates do BBB
            com selecao manual de fonte antes da reproducao.
          </p>
        </div>
      </section>

      <main className="px-4 pb-16 md:px-12">
        <section>
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/42">Esportes</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Canais esportivos</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {sportsChannels.map((channel, index) => (
              <ChannelCard key={channel.slug} channel={channel} index={index} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.34em] text-white/42">Reality</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">BBB</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {bbbChannels.map((channel, index) => (
              <ChannelCard key={channel.slug} channel={channel} index={index} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Channels;
