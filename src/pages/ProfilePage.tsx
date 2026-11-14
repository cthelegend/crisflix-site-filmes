import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, LogOut, Pencil, Plus, RefreshCw, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import Brand from "@/components/Brand";
import ProfileEditor from "@/components/ProfileEditor";
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProfilePage() {
  const { loading, profiles, profilesError, activeProfile, selectProfile, refreshProfile, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [managing, setManaging] = useState(false);
  const [editor, setEditor] = useState<UserProfile | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  if (!loading && !user) return <Navigate to="/auth" replace />;
  const logout = async () => {
    if (busy) return;
    setBusy(true);
    try { await signOut(); navigate("/", { replace: true }); }
    catch { toast.error("Não foi possível sair. Tente novamente."); }
    finally { setBusy(false); }
  };
  const retry = async () => {
    setBusy(true);
    try { await refreshProfile(); } catch { toast.error("Não foi possível carregar os perfis."); }
    finally { setBusy(false); }
  };
  return <div className="revolution-screen relative min-h-screen bg-black">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.18),transparent_55%)]" />
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-10 sm:px-6">
      <Brand centered />
      <h1 className="mt-9 text-center text-2xl font-bold tracking-tight text-white sm:mt-12 sm:text-4xl">{managing ? "Seus perfis" : "Quem está assistindo?"}</h1>
      {loading ? <p role="status" className="my-12 text-sm text-white/60">Carregando perfis...</p> : profilesError ? <div className="my-9 max-w-sm text-center">
        <p role="alert" className="text-sm leading-6 text-white/65">{profilesError}</p>
        <Button type="button" disabled={busy} onClick={() => { void retry(); }} className="mt-4 gap-2 rounded-full bg-white/10 text-white hover:bg-white/15"><RefreshCw size={15} />Tentar novamente</Button>
      </div> : <div className="my-9 flex w-full flex-wrap items-start justify-center gap-x-5 gap-y-7 sm:my-12 sm:gap-9">
        {profiles.map((item) => <button key={item.id} type="button" aria-label={managing ? `Editar perfil ${item.display_name}` : `Usar perfil ${item.display_name}`} onClick={() => {
          if (managing) setEditor(item);
          else { selectProfile(item); navigate("/"); }
        }} className="group flex w-24 min-w-0 flex-col items-center text-center sm:w-32">
          <span className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-2 bg-white/5 transition-colors group-hover:border-white/65 sm:h-32 sm:w-32 ${activeProfile?.id === item.id ? "border-primary" : "border-white/10"}`}>
            {item.avatar_url ? <img src={item.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserCircle2 size={48} className="text-white/65" />}
            {managing && <span className="absolute inset-0 flex items-center justify-center bg-black/40"><Pencil size={26} className="text-white" /></span>}
          </span>
          <span className="mt-3 w-full break-words text-sm font-medium text-white/85 sm:text-base">{item.display_name}</span>
          {activeProfile?.id === item.id && <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/40"><Check size={11} />Em uso</span>}
        </button>)}
        {profiles.length < 3 && <button type="button" aria-label="Adicionar perfil" onClick={() => setEditor("new")} className="group flex w-24 flex-col items-center text-center sm:w-32">
          <span className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-dashed border-white/20 bg-white/[0.02] text-white/45 transition-colors group-hover:border-primary/70 group-hover:text-primary sm:h-32 sm:w-32"><Plus size={36} strokeWidth={1.5} /></span>
          <span className="mt-3 text-xs text-white/55 sm:text-sm">Adicionar perfil</span>
        </button>}
      </div>}
      {!loading && !profilesError && <>
        <p className="mb-5 text-[11px] text-white/35">{profiles.length} de 3 perfis</p>
        <Button type="button" onClick={() => setManaging((value) => !value)} className="h-11 rounded-full border border-white/25 bg-transparent px-6 text-xs text-white hover:bg-white/10">{managing ? "Concluir" : "Gerenciar perfis"}</Button>
      </>}
      <div className="mt-7 flex flex-wrap justify-center gap-5 text-xs text-white/50">
        {activeProfile && <Link to="/" className="inline-flex min-h-11 items-center gap-2 hover:text-white"><ArrowLeft size={14} />Voltar ao site</Link>}
        <button type="button" disabled={busy} onClick={() => { void logout(); }} className="inline-flex min-h-11 items-center gap-2 hover:text-red-300 disabled:opacity-40"><LogOut size={14} />{busy ? "Aguarde..." : "Sair da conta"}</button>
      </div>
    </main>
    <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) setEditor(null); }}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto rounded-3xl border-white/10 bg-[#171214] p-5 text-white sm:p-7">
        <DialogHeader><DialogTitle>{editor === "new" ? "Criar perfil" : "Editar perfil"}</DialogTitle><DialogDescription className="text-xs leading-6 text-white/50">Uma conta, até três jeitos de assistir.</DialogDescription></DialogHeader>
        {editor && <ProfileEditor key={editor === "new" ? "new" : editor.id} profile={editor === "new" ? undefined : editor} onSaved={() => setEditor(null)} onCancel={() => setEditor(null)} />}
      </DialogContent>
    </Dialog>
  </div>;
}
