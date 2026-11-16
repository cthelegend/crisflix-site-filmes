import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/hooks/use-cookie-consent";
import { chooseCookieConsent, CONSENT_KEY, refreshCookieConsent } from "@/lib/cookieConsent";

export default function CookieBanner() {
  const consent = useCookieConsent();
  const [reopened, setReopened] = useState(false);
  const banner = useRef<HTMLElement>(null);
  const location = useLocation();
  const visible = location.pathname !== "/cris" && (!consent || reopened);
  useEffect(() => {
    const reopen = () => { setReopened(true); };
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) refreshCookieConsent(); };
    window.addEventListener("open-cookie-choices", reopen);
    window.addEventListener("storage", storage);
    return () => { window.removeEventListener("open-cookie-choices", reopen); window.removeEventListener("storage", storage); };
  }, []);
  useEffect(() => {
    if (!visible || !banner.current) return;
    const element = banner.current;
    const update = () => document.documentElement.style.setProperty("--cookie-notice-space", `${element.offsetHeight + 32}px`);
    update();
    const observer = new ResizeObserver(update); observer.observe(element);
    return () => { observer.disconnect(); document.documentElement.style.removeProperty("--cookie-notice-space"); };
  }, [visible]);
  if (!visible) return null;
  const choose = (accepted: boolean) => { chooseCookieConsent(accepted); setReopened(false); };
  return <aside ref={banner} aria-label="Cookies e armazenamento local" className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-2xl rounded-3xl border border-white/15 bg-[#191416] p-5 text-white shadow-[0_10px_70px_rgba(0,0,0,0.65)] sm:inset-x-6 sm:bottom-6 sm:p-6">
    <h2 className="flex items-center gap-2 text-base font-semibold"><Cookie size={18} className="text-primary" />Cookies e armazenamento local</h2>
    <p className="mt-3 text-xs leading-6 text-white/70">Podemos guardar suas preferências e o “Continuar assistindo” neste navegador. A sessão de login usa armazenamento necessário. Com uma conta, perfis, listas e histórico também são salvos no serviço. Players externos têm políticas próprias.</p>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/70"><Link to="/privacidade" className="inline-flex min-h-9 items-center underline underline-offset-4 hover:text-white">Privacidade e cookies</Link><Link to="/termos" className="inline-flex min-h-9 items-center underline underline-offset-4 hover:text-white">Termos de Serviço</Link></div>
    <div className="mt-3 grid grid-cols-2 gap-3">
      <button type="button" onClick={() => choose(false)} className="min-h-11 rounded-full border border-white/50 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Recusar opcionais</button>
      <button type="button" onClick={() => choose(true)} className="min-h-11 rounded-full border border-white bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/85">Aceitar opcionais</button>
    </div>
  </aside>;
}
