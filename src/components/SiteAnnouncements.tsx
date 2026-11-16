import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Megaphone } from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { isScheduledActive } from "@/lib/siteContent";
export default function SiteAnnouncements() {
  const { content, now } = useSiteContent();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const notices = content.notices.filter(n => isScheduledActive(n, now) && !dismissed.includes(n.id));
  if (!notices.length) return null;
  return <aside aria-label="Avisos do site" className="mx-4 mb-4 space-y-2 pt-24 md:mx-12 md:pt-28">{notices.map(n => <div key={n.id} className="relative mx-auto max-w-6xl rounded-2xl border border-primary/30 bg-primary/10 py-4 pl-4 pr-12 text-sm">
    <h2 className="flex items-center gap-2 font-semibold"><Megaphone size={16} className="shrink-0 text-primary" />{n.title}</h2>
    <p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-white/75">{n.message}</p>
    {n.href && (n.href.startsWith("/") ? <Link to={n.href} className="mt-2 inline-block text-xs underline">Saiba mais</Link> : <a href={n.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs underline">Saiba mais</a>)}
    <button aria-label={`Fechar aviso: ${n.title}`} onClick={() => setDismissed(v => [...v, n.id])} className="absolute right-1 top-1 grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"><X size={16} /></button>
  </div>)}</aside>;
}
