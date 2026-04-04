import { useEffect, useState } from "react";
import { X } from "lucide-react";

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
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] bg-[#111111]/95 shadow-[0_30px_120px_rgba(0,0,0,0.5)]">
        <div className="bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.24),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/45">Aviso</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Projeto educacional</h2>
            </div>
            <button onClick={handleClose} className="text-white/50 transition-colors hover:text-white">
              <X size={20} />
            </button>
          </div>

          <p className="mt-6 text-sm leading-7 text-white/72">
            O <span className="font-semibold text-primary">CRISFLIX</span> é um projeto sem fins lucrativos, criado apenas para fins educacionais e de estudo.
            Não hospedamos, armazenamos ou distribuímos conteúdo protegido por direitos autorais.
          </p>

          <p className="mt-4 text-sm leading-7 text-white/72">
            Caso você seja detentor de direitos autorais e deseje a remoção de algum conteúdo, entre em contato pelo e-mail{" "}
            <a href="mailto:cristhianbarbosap@gmail.com" className="text-primary hover:underline">
              cristhianbarbosap@gmail.com
            </a>
            .
          </p>

          <button
            onClick={handleClose}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPopup;
