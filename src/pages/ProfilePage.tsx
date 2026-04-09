import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const { activeProfile, loading, profile, selectProfile, updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const [manageMode, setManageMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");

  useEffect(() => {
    setDisplayName(profile?.display_name || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile?.avatar_url, profile?.display_name]);

  const initials = useMemo(
    () =>
      (profile?.display_name || "Perfil")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join(""),
    [profile?.display_name],
  );

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleProfileClick = () => {
    if (!profile) return;
    if (manageMode) {
      setEditing(true);
      return;
    }

    selectProfile(profile);
    navigate("/");
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      setEditing(false);
      toast.success("Perfil atualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar o perfil.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.22),transparent_24%),linear-gradient(180deg,rgba(0,0,0,0.16),rgba(0,0,0,0.92))]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <section className="w-full max-w-5xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-3xl font-bold tracking-[0.16em] text-primary" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              CRISFLIX
            </p>
            <h1 className="mt-8 text-3xl font-bold text-white sm:text-4xl md:text-5xl">Quem está assistindo?</h1>
            <p className="mt-3 text-sm leading-6 text-white/54 md:text-base">
              Escolha seu perfil para continuar.
            </p>
          </div>

          <div className="mt-10 flex flex-col items-center">
            <button
              onClick={handleProfileClick}
              className="group relative flex flex-col items-center"
            >
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/10 text-white shadow-[0_18px_50px_rgba(0,0,0,0.24)] transition-all group-hover:border-white/30 group-hover:bg-white/14 sm:h-36 sm:w-36">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.display_name || "Perfil"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <UserCircle2 size={42} className="opacity-90 sm:size-[54px]" />
                    <span className="mt-2 text-lg font-semibold sm:text-xl">{initials}</span>
                  </div>
                )}
              </div>

              <span className="mt-4 text-base text-white/80 transition-colors group-hover:text-white sm:text-lg">
                {profile?.display_name || "Meu perfil"}
              </span>
            </button>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={() => setManageMode((current) => !current)}
                className="h-11 rounded-full border border-white bg-transparent px-6 text-white hover:bg-white hover:text-black"
              >
                {manageMode ? "Concluir" : "Gerenciar perfil"}
              </Button>
            </div>
          </div>

          {editing && (
            <div className="mx-auto mt-10 max-w-xl rounded-[2rem] border border-white/10 bg-black/60 p-5 backdrop-blur-2xl sm:p-6">
              <div className="mb-5 flex items-center gap-2 text-white">
                <Pencil size={18} />
                <h2 className="text-xl font-semibold">Editar perfil</h2>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">Nome</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Foto do perfil (URL)</label>
                  <Input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button type="submit" className="h-11 rounded-full border border-white bg-white px-6 text-black hover:bg-black hover:text-white">
                    Salvar
                  </Button>
                  <Button type="button" onClick={() => setEditing(false)} className="h-11 rounded-full border border-white bg-transparent px-6 text-white hover:bg-white hover:text-black">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;
