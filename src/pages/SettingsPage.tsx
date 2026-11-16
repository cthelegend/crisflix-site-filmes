import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { openCookieChoices } from "@/lib/cookieConsent";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Settings } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSitePreferences } from "@/contexts/SitePreferencesContext";
import type { SitePreferences } from "@/lib/sitePreferences";
import Brand from "@/components/Brand";
import { Switch } from "@/components/ui/switch";
import type { ReactNode } from "react";

function PreferenceRow({ id, title, description, children }: { id: string; title: string; description: string; children: ReactNode }) {
  return <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
    <div className="min-w-0 flex-1"><label htmlFor={id} className="block text-sm font-semibold text-white">{title}</label><p id={`${id}-description`} className="mt-1 text-xs leading-6 text-white/50">{description}</p></div>
    {children}
  </div>;
}
const selectClass = "h-11 w-full rounded-xl border border-white/15 bg-[#241c20] px-3 text-base text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:w-44 sm:shrink-0";
export default function SettingsPage() {
  const consent = useCookieConsent();
  const { user, loading } = useAuth();
  const { preferences, updatePreferences, resetPreferences } = useSitePreferences();
  if (loading) return <main role="status" className="flex min-h-screen items-center justify-center text-sm text-white/60">Carregando configurações...</main>;
  if (!user) return <Navigate to="/auth" replace />;
  return <div className="revolution-screen min-h-screen bg-black">
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center"><Brand centered /></div>
      <Link to="/" className="mb-7 mt-6 flex min-h-11 w-fit items-center gap-2 text-xs text-white/60 hover:text-white"><ArrowLeft size={16} />Voltar ao site</Link>
      <div className="mb-2 flex items-center gap-3"><Settings size={21} className="text-primary" /><h1 className="text-2xl font-bold text-white sm:text-3xl">Configurações</h1></div>
      <p className="mb-6 text-xs leading-6 text-white/50">{consent?.functional ? "Suas preferências são salvas automaticamente neste navegador." : "Suas preferências valem nesta visita. Autorize o armazenamento opcional para guardá-las neste navegador."}</p>
      <section aria-label="Preferências do site" className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-[#161214]/95 p-5 sm:p-7">
        <PreferenceRow id="preference-motion" title="Animações" description="Escolha a intensidade dos movimentos e transições.">
          <select id="preference-motion" aria-describedby="preference-motion-description" value={preferences.motion} onChange={(e) => updatePreferences({ motion: e.target.value as SitePreferences["motion"] })} className={selectClass}>
            <option value="system">Seguir o sistema</option><option value="full">Completas</option><option value="reduced">Reduzidas</option>
          </select>
        </PreferenceRow>
        <PreferenceRow id="preference-highlights" title="Destaques automáticos" description="Troque os banners automaticamente. Com movimentos reduzidos, a troca é manual.">
          <Switch id="preference-highlights" aria-describedby="preference-highlights-description" checked={preferences.rotateHighlights} onCheckedChange={(rotateHighlights) => updatePreferences({ rotateHighlights })} className="shrink-0" />
        </PreferenceRow>
        <PreferenceRow id="preference-cards" title="Tamanho dos cards" description="Ajuste o espaço dos filmes e séries no catálogo.">
          <select id="preference-cards" aria-describedby="preference-cards-description" value={preferences.cardSize} onChange={(e) => updatePreferences({ cardSize: e.target.value as SitePreferences["cardSize"] })} className={selectClass}>
            <option value="compact">Compacto</option><option value="comfortable">Confortável</option>
          </select>
        </PreferenceRow>
        <PreferenceRow id="preference-text" title="Tamanho do texto" description="Amplie os textos para uma leitura mais confortável.">
          <select id="preference-text" aria-describedby="preference-text-description" value={preferences.textSize} onChange={(e) => updatePreferences({ textSize: e.target.value as SitePreferences["textSize"] })} className={selectClass}>
            <option value="standard">Padrão</option><option value="large">Ampliado</option>
          </select>
        </PreferenceRow>
        <PreferenceRow id="preference-data" title="Economia de dados" description="Use imagens menores e carregue menos conteúdo antecipadamente. Não altera a qualidade do vídeo.">
          <Switch id="preference-data" aria-describedby="preference-data-description" checked={preferences.saveData} onCheckedChange={(saveData) => updatePreferences({ saveData })} className="shrink-0" />
        </PreferenceRow>
        <PreferenceRow id="preference-start" title="Página inicial" description="Escolha onde entrar ao abrir o site ou selecionar um perfil.">
          <select id="preference-start" aria-describedby="preference-start-description" value={preferences.startPage} onChange={(e) => updatePreferences({ startPage: e.target.value as SitePreferences["startPage"] })} className={selectClass}>
            <option value="home">Início</option><option value="my-list">Minha lista</option><option value="library">Biblioteca</option>
          </select>
        </PreferenceRow>
      </section>
      <button type="button" onClick={() => { resetPreferences(); toast.success("Preferências restauradas."); }} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-medium text-white/75 hover:bg-white/5"><RotateCcw size={15} />Restaurar preferências</button>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60"><button type="button" onClick={openCookieChoices} className="min-h-11 underline underline-offset-4 hover:text-white">Gerenciar cookies</button><Link to="/privacidade" className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-white">Privacidade e cookies</Link></div>
    </main>
  </div>;
}
