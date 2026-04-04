import { useEffect, useState } from "react";
import { Heart, QrCode, X } from "lucide-react";

const DONATION_WIDGET_URL = "https://widget.livepix.gg/embed/9d6ba6a3-a111-45de-9c4a-e354b1100a4c";

const DisclaimerPopup = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("crisflix-disclaimer");
    if (!dismissed) setOpen(true);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("crisflix-disclaimer", "1");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/72 px-4 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]/95 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.24),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/45">Aviso</p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Projeto sem fins lucrativos</h2>
            </div>
            <button onClick={handleClose} className="text-white/50 transition-colors hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm leading-7 text-white/78 md:text-base">
                O <span className="font-semibold text-primary">CRISFLIX</span> é um projeto independente, criado para fins
                educacionais e mantido sem objetivos comerciais. Se você curte a proposta e quer ajudar a manter o projeto no
                ar, pode apoiar com uma doação via Pix.
              </p>

              <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
                O apoio é totalmente opcional, mas faz diferença para custos de manutenção, melhorias visuais e novas
                funcionalidades.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleClose}
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
                >
                  Entendi
                </button>
                <a
                  href="/donate"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/18 bg-white/8 px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
                >
                  <Heart size={16} className="mr-2" /> Apoiar o projeto
                </a>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-black/30 p-4">
              <div className="mb-4 flex items-center gap-2 text-white/72">
                <QrCode size={18} />
                <p className="text-sm font-medium">Doação via Pix</p>
              </div>

              <div className="overflow-hidden rounded-[1.3rem] border border-white/10 bg-black">
                <iframe
                  src={DONATION_WIDGET_URL}
                  title="Doação Pix"
                  className="h-[420px] w-full"
                  allow="clipboard-write"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-black/30 p-4 text-sm leading-7 text-white/68">
            <p className="font-medium text-white/84">Remoção de conteúdo</p>
            <p className="mt-2">
              Não hospedamos, armazenamos ou distribuímos conteúdo protegido por direitos autorais. Caso você seja detentor de
              direitos e deseje a remoção de algum conteúdo, entre em contato pelo e-mail{" "}
              <a href="mailto:cristhianbarbosap@gmail.com" className="text-primary hover:underline">
                cristhianbarbosap@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPopup;
