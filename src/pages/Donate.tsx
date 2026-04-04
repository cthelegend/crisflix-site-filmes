import { Heart, QrCode } from "lucide-react";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

const DONATION_WIDGET_URL = "https://widget.livepix.gg/embed/9d6ba6a3-a111-45de-9c4a-e354b1100a4c";

const Donate = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 pb-16 pt-24 md:px-12 md:pt-28">
        <section className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80 md:text-sm md:tracking-[0.35em]">Apoio</p>
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl md:text-5xl">Ajude a manter o projeto no ar</h1>
              <p className="mt-5 text-sm leading-7 text-white/68 md:text-base">
                O CRISFLIX é um projeto sem fins lucrativos. Se você gosta da proposta e quer ajudar com custos de manutenção,
                melhorias e continuidade, pode apoiar com uma doação via Pix.
              </p>

              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-2 text-white">
                  <Heart size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold">Apoio opcional</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Toda contribuição é voluntária e ajuda a manter a experiência funcionando sem fins comerciais.
                </p>
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-black/25 p-5">
                <div className="flex items-center gap-2 text-white">
                  <QrCode size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold">Remoção de conteúdo</h2>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  Caso você seja detentor de direitos autorais e deseje a remoção de algum conteúdo, entre em contato pelo e-mail{" "}
                  <a href="mailto:cristhianbarbosap@gmail.com" className="text-primary hover:underline">
                    cristhianbarbosap@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-black/35 p-4">
              <div className="mb-4 flex items-center gap-2 text-white/78">
                <QrCode size={18} />
                <p className="text-sm font-medium">QR Code Pix</p>
              </div>
              <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
                <iframe
                  src={DONATION_WIDGET_URL}
                  title="Doação Pix"
                  className="h-[640px] w-full"
                  allow="clipboard-write"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Donate;
