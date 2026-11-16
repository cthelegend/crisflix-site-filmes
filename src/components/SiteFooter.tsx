import { openCookieChoices } from "@/lib/cookieConsent";
import Brand from "./Brand";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { Link } from "react-router-dom";

const SiteFooter = () => {
  const { content } = useSiteContent();
  return (
    <footer className="site-footer border-t border-white/10 bg-black px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-10 md:px-8 lg:px-12">
      <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="mx-auto md:mx-0">
          <Brand />
        </div>

        <div className="footer-links flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/54 md:justify-end">
          <Link to="/" className="transition-colors hover:text-white">Início</Link>
          <Link to="/quem-somos" className="transition-colors hover:text-white">Quem somos?</Link>
          <Link to="/browse/movies" className="transition-colors hover:text-white">Filmes</Link>
          <Link to="/browse/tv" className="transition-colors hover:text-white">Séries</Link>
          <Link to="/futebol" className="transition-colors hover:text-white">Futebol</Link>
          <Link to="/donate" className="transition-colors hover:text-white">Doar</Link>
          <Link to="/my-list" className="transition-colors hover:text-white">Minha lista</Link>
        </div>
      </div>
      {content.appearance.footerNote && <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-6 text-white/55">{content.appearance.footerNote}</p>}
      <nav aria-label="Informações e privacidade" className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-5 text-xs text-white/50 md:justify-end">
        <Link to="/termos" className="inline-flex min-h-11 items-center hover:text-white">Termos de Serviço</Link>
        <Link to="/privacidade" className="inline-flex min-h-11 items-center hover:text-white">Privacidade e cookies</Link>
        <button type="button" onClick={openCookieChoices} className="min-h-11 hover:text-white">Gerenciar cookies</button>
      </nav>
    </footer>
  );
};

export default SiteFooter;
