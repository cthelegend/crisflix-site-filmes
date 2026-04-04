import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="border-t border-white/6 bg-black px-4 py-10 md:px-12">
      <div className="flex flex-col gap-6 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div className="mx-auto md:mx-0">
          <p className="text-2xl font-bold tracking-[0.14em] text-primary" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            CRISFLIX
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/44">
            Catálogo com informações detalhadas de filmes e séries.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-white/54 md:justify-end">
          <Link to="/" className="transition-colors hover:text-white">Início</Link>
          <Link to="/browse/movies" className="transition-colors hover:text-white">Filmes</Link>
          <Link to="/browse/tv" className="transition-colors hover:text-white">Séries</Link>
          <Link to="/legal/dmca" className="transition-colors hover:text-white">DMCA</Link>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
