import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Bookmark, BookOpen, CircleHelp, Film, Heart, Home, LogOut, Settings, Tv } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Brand from "@/components/Brand";
import FootballIcon from "@/components/icons/FootballIcon";
import { useAuth } from "@/contexts/AuthContext";

const destinations = [
  { to: "/", label: "Início", icon: Home },
  { to: "/quem-somos", label: "Quem somos?", icon: CircleHelp },
  { to: "/browse/movies", label: "Filmes", icon: Film },
  { to: "/browse/tv", label: "Séries", icon: Tv },
  { to: "/futebol", label: "Futebol", icon: FootballIcon },
  { to: "/biblioteca", label: "Biblioteca da Esquerda", icon: BookOpen },
  { to: "/donate", label: "Doar", icon: Heart },
  { to: "/my-list", label: "Minha lista", icon: Bookmark },
];
export default function SettingsPage() {
  const { user, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();
  if (loading) return <main role="status" className="flex min-h-screen items-center justify-center text-sm text-white/60">Carregando configurações...</main>;
  if (!user) return <Navigate to="/auth" replace />;
  const logout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try { await signOut(); navigate("/", { replace: true }); }
    catch { toast.error("Não foi possível sair. Tente novamente."); }
    finally { setSigningOut(false); }
  };
  return <div className="revolution-screen min-h-screen bg-black">
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center"><Brand centered /></div>
      <Link to="/" className="mb-7 mt-6 flex min-h-11 w-fit items-center gap-2 text-xs text-white/60 hover:text-white"><ArrowLeft size={16} />Voltar ao site</Link>
      <div className="mb-6 flex items-center gap-3"><Settings size={21} className="text-primary" /><h1 className="text-2xl font-bold text-white sm:text-3xl">Configurações</h1></div>
      <section className="rounded-3xl border border-white/10 bg-[#161214]/95 p-4 sm:p-6">
        <h2 className="mb-4 px-1 text-sm font-semibold text-white/75">Navegação do site</h2>
        <nav aria-label="Navegação do site" className="space-y-1">
          {destinations.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className="group flex min-h-12 items-center gap-3 rounded-2xl px-3 py-3 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Icon size={18} className="shrink-0 text-white/45" /><span className="flex-1">{label}</span><ArrowUpRight size={15} className="text-white/25 transition-colors group-hover:text-white/60" />
          </Link>)}
        </nav>
        <div className="mt-3 border-t border-white/10 pt-3">
          <button type="button" onClick={() => { void logout(); }} disabled={signingOut} className="flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"><LogOut size={18} />{signingOut ? "Saindo..." : "Sair"}</button>
        </div>
      </section>
    </main>
  </div>;
}
