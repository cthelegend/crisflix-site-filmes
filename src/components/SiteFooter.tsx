import Brand from "./Brand";
import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="site-footer border-t border-white/10 bg-black px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-10 md:px-8 lg:px-12">
      <div className="flex flex-col gap-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="mx-auto md:mx-0">
          <Brand />
        </div>

        <div className="footer-links flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/54 md:justify-end">
          <Link to="/" className="transition-colors hover:text-white">Início</Link>
          <Link to="/browse/movies" className="transition-colors hover:text-white">Filmes</Link>
          <Link to="/browse/tv" className="transition-colors hover:text-white">Séries</Link>
          <Link to="/my-list" className="transition-colors hover:text-white">Minha Lista</Link>
          <Link to="/profile" className="transition-colors hover:text-white">Perfis</Link>
          <Link to="/donate" className="transition-colors hover:text-white">Doar</Link>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
