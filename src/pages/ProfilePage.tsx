import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Camera, ImageIcon, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

function createAvatarPreset(from: string, to: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="52" fill="url(#bg)"/>
      <circle cx="160" cy="126" r="58" fill="#fff" opacity="0.92"/>
      <path d="M73 269c18-61 58-94 87-94s69 33 87 94" fill="#fff" opacity="0.92"/>
      <circle cx="125" cy="119" r="10" fill="${accent}"/>
      <circle cx="195" cy="119" r="10" fill="${accent}"/>
      <path d="M129 153c18 14 44 14 62 0" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const AVATAR_PRESETS = [
  createAvatarPreset("#e50914", "#671016", "#111111"),
  createAvatarPreset("#0f766e", "#042f2e", "#111827"),
  createAvatarPreset("#2563eb", "#111827", "#1e3a8a"),
  createAvatarPreset("#f59e0b", "#7c2d12", "#431407"),
  createAvatarPreset("#9333ea", "#111827", "#581c87"),
  createAvatarPreset("#16a34a", "#052e16", "#14532d"),
];

const ProfilePage = () => {
  const { loading, profile, selectProfile, updateProfile, uploadAvatar, user } = useAuth();
  const navigate = useNavigate();
  const [manageMode, setManageMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name || "");
    setAvatarUrl(profile?.avatar_url || "");
  }, [profile?.avatar_url, profile?.display_name]);

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

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const publicUrl = await uploadAvatar(file);
      setAvatarUrl(publicUrl);
      toast.success("Foto enviada. Salve o perfil para aplicar.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
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
                  <UserCircle2 size={54} className="opacity-90" />
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
                <ImageIcon size={18} />
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
                  <label className="mb-3 block text-sm text-white/70">Foto do perfil</label>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] border border-white/10 bg-white/10 text-white">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Prévia do perfil" className="h-full w-full object-cover" />
                      ) : (
                        <UserCircle2 size={44} className="opacity-80" />
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-black hover:text-white">
                        <Camera size={16} />
                        {uploadingAvatar ? "Enviando..." : "Enviar foto"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          disabled={uploadingAvatar}
                          onChange={handleAvatarUpload}
                        />
                      </label>
                      <p className="mt-3 text-xs leading-5 text-white/48">
                        Use uma imagem do computador ou escolha uma opção da biblioteca.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm text-white/70">Biblioteca de avatares</p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {AVATAR_PRESETS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setAvatarUrl(avatar)}
                        className={`overflow-hidden rounded-[1.2rem] border bg-white/5 transition-all hover:scale-105 ${
                          avatarUrl === avatar ? "border-white" : "border-white/10"
                        }`}
                      >
                        <img src={avatar} alt="Avatar da biblioteca" className="aspect-square w-full object-cover" />
                      </button>
                    ))}
                  </div>
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
