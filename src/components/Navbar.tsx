import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bookmark, CircleHelp, Film, Home, LogOut, Search, Settings, Tv, Users, UserCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import Brand from "./Brand";
import FootballIcon from "./icons/FootballIcon";
import { GlassTabBar, GlassTabBarItem } from "./ui/glass-tab-bar";

const LibraryIcon = ({ size = 36 }: { size?: number }) => (
  <span className="library-tab-disc" data-independent-indicator>
    <img src="/hammer-sickle.png" width={size} height={size} alt="" aria-hidden="true" />
  </span>
);

const destinations = [
  { to: "/", label: "Início", icon: Home },
  { to: "/browse/movies", label: "Filmes", icon: Film },
  { to: "/biblioteca", label: "Biblioteca da Esquerda", icon: LibraryIcon },
  { to: "/browse/tv", label: "Séries", icon: Tv },
  { to: "/futebol", label: "Futebol", icon: FootballIcon },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProfile, user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try { await signOut(); closePanels(); navigate("/", { replace: true }); }
    catch { toast.error("Não foi possível sair. Tente novamente."); }
    finally { setSigningOut(false); }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closePanels = () => {
    setSearchOpen(false);
    setQuery("");
  };

  useEffect(closePanels, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanels();
        if (searchOpen) searchButtonRef.current?.focus();
        return;
      }
      const target = event.target;
      const isTyping = target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable);
      if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") || (event.key === "/" && !isTyping)) {
        event.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    closePanels();
  };

  return (
    <>
      {searchOpen && <button type="button" onClick={closePanels} aria-label="Fechar painel de navegação" className="fixed inset-0 z-40 bg-black/65" />}
      <header data-raised={scrolled || searchOpen} className="site-header navbar-glass fixed inset-x-0 top-0 z-50 px-4 py-3 transition-colors md:px-8 lg:px-12">
        <div className="flex items-center justify-between gap-2">
          <Brand onClick={closePanels} />
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <button ref={searchButtonRef} type="button" onClick={() => searchOpen ? closePanels() : openSearch()} aria-label={searchOpen ? "Fechar busca" : "Buscar filmes e séries"} aria-expanded={searchOpen} aria-controls="site-search" className="nav-icon">
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" aria-label="Menu do perfil" className="nav-icon" onClick={closePanels}>
                    {activeProfile?.avatar_url ? <img src={activeProfile.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" /> : <UserCircle2 size={22} />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={12} className="z-[110] w-56 rounded-2xl border-white/10 bg-[#171214] p-2 text-white shadow-2xl">
                  <DropdownMenuLabel className="truncate px-3 text-xs font-medium text-white/55">{activeProfile?.display_name || "Sua conta"}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onSelect={() => navigate("/profile")} className="min-h-11 gap-3 rounded-xl px-3 focus:bg-white/10 focus:text-white"><Users size={17} />Trocar perfil</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => navigate("/settings")} className="min-h-11 gap-3 rounded-xl px-3 focus:bg-white/10 focus:text-white"><Settings size={17} />Configurações</DropdownMenuItem>
                  <DropdownMenuItem disabled={signingOut} onSelect={() => { void handleSignOut(); }} className="min-h-11 gap-3 rounded-xl px-3 text-red-400 focus:bg-red-500/10 focus:text-red-300"><LogOut size={17} />{signingOut ? "Saindo..." : "Sair"}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : <Link to="/auth" aria-label="Entrar" onClick={closePanels} className="nav-icon"><UserCircle2 size={22} /></Link>}
            <Link to={user ? "/my-list" : "/quem-somos"} aria-label={user ? "Minha lista" : "Quem somos?"} title={user ? "Minha lista" : "Quem somos?"} onClick={closePanels} className={`nav-icon ${user ? "nav-watchlist" : "hidden lg:inline-flex"}`}>
              {user ? <Bookmark size={20} /> : <CircleHelp size={20} />}
            </Link>
          </div>
        </div>
        {searchOpen && (
          <form id="site-search" role="search" onSubmit={handleSearch} className="mx-auto mt-4 flex max-w-3xl gap-2 pb-1">
            <label htmlFor="catalog-search" className="sr-only">Buscar no catálogo</label>
            <input id="catalog-search" ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Qual filme ou série você procura?" type="search" enterKeyHint="search" className="h-12 min-w-0 flex-1 rounded-full border border-primary/40 bg-black/40 px-3 text-base text-white placeholder:text-white/55" />
            <button type="submit" className="navbar-glass-button min-h-12 shrink-0 rounded-full px-4 text-sm font-semibold text-white">Buscar</button>
          </form>
        )}
      </header>
      <GlassTabBar aria-label="Navegação principal" value={location.pathname} className="navigation-dock">
        {destinations.map(({ to, label, icon: Icon }) => (
          <GlassTabBarItem key={to} to={to} value={to} label={label} icon={<Icon size={to === "/biblioteca" ? 36 : 23} />} iconOnly={to === "/biblioteca"} className={to === "/biblioteca" ? "library-tab" : undefined} onClick={closePanels} />
        ))}
      </GlassTabBar>
    </>
  );
};

export default Navbar;
