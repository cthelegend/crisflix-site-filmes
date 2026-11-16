import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_SITE_CONTENT, isScheduledActive, parseSiteContent, type SiteContent } from "@/lib/siteContent";

const ContentContext = createContext<{ content: SiteContent; ready: boolean; now: number }>({ content: DEFAULT_SITE_CONTENT, ready: false, now: Date.now() });
function hexHsl(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360; return `${h} ${s * 100}% ${l * 100}%`;
}
export const useSiteContent = () => useContext(ContentContext);
export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState(Date.now());
  const query = useQuery({ queryKey: ["published-site-content"], queryFn: async () => {
    const res = await fetch("/api/site-content", { credentials: "omit", signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error("Conteúdo editorial indisponível.");
    return parseSiteContent((await res.json()).content);
  }, staleTime: 30000, refetchInterval: 60000, retry: false });
  const content = query.data || DEFAULT_SITE_CONTENT;
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 15000); return () => clearInterval(timer); }, []);
  const theme = content.themes.find(t => isScheduledActive(t, now));
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--editor-pattern-opacity", String(content.appearance.patternOpacity));
    if (theme) { root.style.setProperty("--primary", hexHsl(theme.accent)); root.style.setProperty("--background", hexHsl(theme.background)); }
    else { root.style.removeProperty("--primary"); root.style.removeProperty("--background"); }
    return () => { ["--primary", "--background", "--editor-pattern-opacity"].forEach(k => root.style.removeProperty(k)); };
  }, [theme, content.appearance.patternOpacity]);
  return <ContentContext.Provider value={{ content, ready: !query.isPending, now }}>{children}</ContentContext.Provider>;
}
