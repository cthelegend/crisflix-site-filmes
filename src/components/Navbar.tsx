import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Menu, Search, UserCircle2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { activeProfile, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closePanels = () => {
    setSearchOpen(false);
    setMenuOpen(false);
    setQuery("");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    closePanels();
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 px-4 py-4 md:px-8 lg:px-12 ${
        scrolled ? "bg-background/78 backdrop-blur-2xl" : "bg-gradient-to-b from-black/70 to-transparent"
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link
            to="/"
            onClick={closePanels}
            className="text-2xl font-bold tracking-[0.18em] text-primary md:text-3xl"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            CRISFLIX
          </Link>

          <div className="hidden items-center gap-4 text-sm text-white/72 lg:flex xl:gap-6">
            <Link to="/" className="transition-colors hover:text-white">
              Início
            </Link>
            <Link to="/browse/movies" className="transition-colors hover:text-white">
              Filmes
            </Link>
            <Link to="/browse/tv" className="transition-colors hover:text-white">
              Séries
            </Link>
            <Link to="/channels" className="transition-colors hover:text-white">
              Canais
            </Link>
            <Link to="/my-list" className="transition-colors hover:text-white">
              Minha Lista
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {searchOpen ? (
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-white/12 bg-white/10 backdrop-blur-md"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Títulos, gêneros..."
                className="w-28 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/45 sm:w-40 lg:w-56"
              />
              <button type="button" onClick={closePanels} className="px-3 text-white/70 transition-colors hover:text-white">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="text-white/72 transition-colors hover:text-white">
              <Search size={20} />
            </button>
          )}

          {user && (
            <Link
              to="/my-list"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
            >
              <Bookmark size={16} />
              Minha Lista
            </Link>
          )}

          <Link
            to={user ? "/profile" : "/auth"}
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/78 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <UserCircle2 size={18} />
            {user ? activeProfile?.display_name || "Perfis" : "Entrar"}
          </Link>

          <button
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/6 p-2.5 text-white/78 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/72 p-4 backdrop-blur-2xl lg:hidden">
          <div className="grid gap-2 text-sm text-white/78">
            <Link to="/" onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              Início
            </Link>
            <Link to="/browse/movies" onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              Filmes
            </Link>
            <Link to="/browse/tv" onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              Séries
            </Link>
            <Link to="/channels" onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              Canais
            </Link>
            <Link to="/my-list" onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              Minha Lista
            </Link>
            <Link to={user ? "/profile" : "/auth"} onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              {user ? "Perfis" : "Entrar"}
            </Link>
            <Link to="/donate" onClick={closePanels} className="rounded-2xl px-3 py-3 transition-colors hover:bg-white/8 hover:text-white">
              Doar
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
