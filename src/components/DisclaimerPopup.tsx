import { useEffect, useState } from "react";
import { QrCode, X } from "lucide-react";

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
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111]/95 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.2),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/45">Aviso</p>
              <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">Projeto sem fins lucrativos</h2>
            </div>
            <button onClick={handleClose} className="text-white/50 transition-colors hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm leading-7 text-white/78 md:text-base">
              O <span className="font-semibold text-primary">CRISFLIX</span> é um projeto independente, criado para fins
              educacionais e mantido sem objetivos comerciais.
            </p>

            <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
              Se você curte a proposta e quiser apoiar a manutenção do projeto, pode contribuir com uma doação via Pix.
            </p>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2 text-white/72">
              <QrCode size={18} />
              <p className="text-sm font-medium">Doação via Pix</p>
            </div>

            <div className="flex justify-center">
              <iframe
                src={DONATION_WIDGET_URL}
                title="Doação Pix"
                className="h-[280px] w-full max-w-[280px] rounded-[1.5rem] border-0 bg-transparent sm:h-[320px] sm:max-w-[320px]"
                allow="clipboard-write"
              />
            </div>
          </div>

          <button
            onClick={handleClose}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-white bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white"
          >
            Entendi
          </button>

          <div className="mt-6 border-t border-white/8 pt-4 text-xs leading-6 text-white/46">
            <p className="font-medium text-white/56">Remoção de conteúdo</p>
            <p className="mt-1">
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
