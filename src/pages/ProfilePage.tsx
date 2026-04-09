import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Bookmark, Heart, PlayCircle, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import ContinueWatchingCard from "@/components/ContinueWatchingCard";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFavorites, fetchRemoteContinueWatching, fetchWatchlist, UserMediaState } from "@/lib/userMedia";
import { Movie } from "@/lib/tmdb";

function toMovieItem(item: UserMediaState): Movie {
  return {
    id: item.media_id,
    title: item.media_type === "movie" ? item.title : undefined,
    name: item.media_type === "tv" ? item.title : undefined,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: "",
    vote_average: item.vote_average,
    release_date: item.release_date || undefined,
    first_air_date: item.first_air_date || undefined,
    genre_ids: [],
    media_type: item.media_type,
  };
}

const ProfilePage = () => {
  const { user, profile, loading, configured, signOut, updateDisplayName } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [favorites, setFavorites] = useState<UserMediaState[]>([]);
  const [watchlist, setWatchlist] = useState<UserMediaState[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  useEffect(() => {
    setDisplayName(profile?.display_name || "");
  }, [profile?.display_name]);

  useEffect(() => {
    if (!user || !configured) return;

    Promise.all([
      fetchFavorites(user.id).then(setFavorites),
      fetchWatchlist(user.id).then(setWatchlist),
      fetchRemoteContinueWatching(user.id).then(setContinueWatching),
    ]).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Não foi possível carregar o perfil.");
    });
  }, [configured, user]);

  const favoriteItems = useMemo(() => favorites.map(toMovieItem), [favorites]);
  const watchlistItems = useMemo(() => watchlist.map(toMovieItem), [watchlist]);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateDisplayName(displayName.trim());
      toast.success("Perfil atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar o perfil.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="px-4 pb-16 pt-24 md:px-12 md:pt-28">
        <section className="mx-auto max-w-7xl space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.34em] text-primary/80 md:text-sm md:tracking-[0.35em]">
                  Perfil
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white">
                    <UserCircle2 size={34} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">{profile?.display_name || "Minha conta"}</h1>
                    <p className="mt-1 text-sm text-white/58">{user?.email}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSave} className="rounded-[1.8rem] border border-white/10 bg-black/35 p-5">
                <label className="mb-2 block text-sm text-white/70">Nome de perfil</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button type="submit" className="h-11 rounded-full border border-white bg-white px-6 text-black hover:bg-black hover:text-white">
                    Salvar perfil
                  </Button>
                  <Button type="button" onClick={() => signOut()} variant="secondary" className="h-11 rounded-full border border-white bg-black px-6 text-white hover:bg-white hover:text-black">
                    Sair
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <PlayCircle size={18} className="text-primary" />
              <h2 className="text-2xl font-semibold text-white">Continuar assistindo</h2>
            </div>
            {continueWatching.length ? (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {continueWatching.map((item) => (
                  <ContinueWatchingCard key={`${item.type}-${item.id}`} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/54">Nenhum progresso salvo ainda.</p>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Heart size={18} className="text-primary" />
              <h2 className="text-2xl font-semibold text-white">Favoritos</h2>
            </div>
            {favoriteItems.length ? (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {favoriteItems.map((item) => (
                  <MovieCard key={`${item.media_type}-${item.id}`} item={item} type={item.media_type as "movie" | "tv"} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/54">Você ainda não favoritou nenhum título.</p>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Bookmark size={18} className="text-primary" />
              <h2 className="text-2xl font-semibold text-white">Minha lista</h2>
            </div>
            {watchlistItems.length ? (
              <div className="flex gap-3 overflow-x-auto pb-4">
                {watchlistItems.map((item) => (
                  <MovieCard key={`${item.media_type}-${item.id}`} item={item} type={item.media_type as "movie" | "tv"} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/54">Sua lista ainda está vazia.</p>
            )}
          </section>

          {!configured && (
            <div className="rounded-[1.6rem] border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-7 text-amber-50">
              O Supabase ainda não está configurado. Preencha as variáveis no ambiente e execute o schema SQL para ativar contas reais.
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default ProfilePage;
