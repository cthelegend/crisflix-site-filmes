import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Camera, Check, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { AVATAR_MAX_BYTES, AVATAR_MIME_TYPES, AVATAR_PRESETS, prepareAvatar } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props { profile?: UserProfile; onSaved: (profile: UserProfile) => void; onCancel?: () => void }
export default function ProfileEditor({ profile, onSaved, onCancel }: Props) {
  const { createProfile, updateProfile, uploadAvatar } = useAuth();
  const [name, setName] = useState(profile?.display_name || "");
  const [avatar, setAvatar] = useState(profile?.avatar_url || AVATAR_PRESETS[0]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preparingPhoto, setPreparingPhoto] = useState(false);
  const [createdProfile, setCreatedProfile] = useState<UserProfile | null>(null);
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    if (!AVATAR_MIME_TYPES.includes(next.type) || next.size > AVATAR_MAX_BYTES) {
      setError("Escolha uma imagem PNG, JPG ou WebP de até 2 MB."); return;
    }
    setError(null); setPreparingPhoto(true);
    try {
      const image = await prepareAvatar(next);
      setFile(new File([image], "avatar.png", { type: "image/png" }));
    } catch { setError("Não foi possível ler esta imagem. Escolha outra foto."); }
    finally { setPreparingPhoto(false); }
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || preparingPhoto) return;
    setSaving(true); setError(null);
    let target = profile || createdProfile;
    try {
      if (!target) {
        target = await createProfile({ displayName: name, avatarUrl: avatar });
        // Keep the created ID if the upload fails, so retry never creates a duplicate.
        setCreatedProfile(target);
      }
      let url = avatar;
      if (file) url = await uploadAvatar(file, target.id);
      const next = profile || createdProfile || file
        ? await updateProfile(target.id, { displayName: name, avatarUrl: url }) : target;
      setFile(null); setAvatar(next.avatar_url || AVATAR_PRESETS[0]); setName(next.display_name);
      toast.success(profile ? "Perfil atualizado." : "Perfil criado. Escolha-o para começar.");
      onSaved(next);
    } catch {
      setError(target ? "Não foi possível salvar o perfil. Confira a imagem e tente novamente." : "Não foi possível criar o perfil. A conta permite até 3 perfis; atualize e tente novamente.");
    } finally { setSaving(false); }
  };
  return <form onSubmit={save} className="space-y-6">
    <fieldset disabled={saving || preparingPhoto} className="space-y-6 disabled:opacity-60">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <label className="relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-white/15 bg-white/5 focus-within:ring-2 focus-within:ring-primary">
          {preview || avatar ? <img src={preview || avatar} alt="Prévia do avatar" className="h-full w-full object-cover" /> : <UserCircle2 size={44} />}
          <span className="absolute inset-x-0 bottom-0 flex min-h-7 items-center justify-center gap-1 bg-black/75 px-1 text-[0.625rem] text-white"><Camera size={12} />{preparingPhoto ? "Preparando..." : "Enviar foto"}</span>
          <input type="file" aria-label="Enviar foto do perfil" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={saving || preparingPhoto} onChange={chooseFile} />
        </label>
        <div className="w-full flex-1">
          <label htmlFor="profile-name" className="mb-2 block text-xs font-medium text-white/70">Nome do perfil</label>
          <Input id="profile-name" name="profile-name" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} placeholder="Como você quer ser chamado?" className="h-12 rounded-xl border-white/15 bg-white/5 text-base text-white" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-white/70">Escolha um avatar</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {AVATAR_PRESETS.map((url, index) => <button key={url} type="button" aria-label={`Avatar ${index + 1}`} aria-pressed={!file && avatar === url} onClick={() => { setFile(null); setAvatar(url); }} className={`relative overflow-hidden rounded-2xl border-2 transition-colors ${!file && avatar === url ? "border-primary" : "border-transparent hover:border-white/30"}`}>
            <img src={url} alt="" className="aspect-square w-full" />
            {!file && avatar === url && <span className="absolute bottom-1 right-1 rounded-full bg-primary p-0.5 text-white"><Check size={12} /></span>}
          </button>)}
        </div>
      </div>
    </fieldset>
    {error && <p role="alert" className="text-sm leading-6 text-red-300">{error}</p>}
    <div className="flex flex-wrap gap-3">
      <Button type="submit" disabled={saving || preparingPhoto || !name.trim()} className="h-11 rounded-full bg-white px-6 text-black hover:bg-white/85">{saving ? "Salvando..." : profile || createdProfile ? "Salvar alterações" : "Criar perfil"}</Button>
      {onCancel && <Button type="button" disabled={saving} onClick={onCancel} className="h-11 rounded-full border border-white/15 bg-transparent px-5 text-white hover:bg-white/10">Cancelar</Button>}
    </div>
  </form>;
}
