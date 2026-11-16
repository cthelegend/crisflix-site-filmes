import { createContext, useContext, useLayoutEffect, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { DEFAULT_PREFERENCES, getSitePreferences, PREFERENCES_KEY, resetSitePreferences, subscribePreferences, syncStoredPreferences, updateSitePreferences, type SitePreferences } from "@/lib/sitePreferences";

interface PreferencesValue {
  preferences: SitePreferences;
  reducedMotion: boolean;
  updatePreferences: typeof updateSitePreferences;
  resetPreferences: typeof resetSitePreferences;
}
const PreferencesContext = createContext<PreferencesValue | null>(null);
export function SitePreferencesProvider({ children }: { children: ReactNode }) {
  const preferences = useSyncExternalStore(subscribePreferences, getSitePreferences, () => DEFAULT_PREFERENCES);
  const [systemReducedMotion, setSystemReducedMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setSystemReducedMotion(media.matches);
    media.addEventListener("change", changed);
    const storage = (event: StorageEvent) => { if (event.key === PREFERENCES_KEY || event.key === null) syncStoredPreferences(); };
    window.addEventListener("storage", storage);
    return () => { media.removeEventListener("change", changed); window.removeEventListener("storage", storage); };
  }, []);
  const reducedMotion = preferences.motion === "reduced" || preferences.motion === "system" && systemReducedMotion;
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reducedMotion ? "reduced" : "full";
    root.dataset.cardSize = preferences.cardSize;
    root.dataset.textSize = preferences.textSize;
    root.dataset.saveData = String(preferences.saveData);
  }, [preferences, reducedMotion]);
  const value = useMemo(() => ({ preferences, reducedMotion, updatePreferences: updateSitePreferences, resetPreferences: resetSitePreferences }), [preferences, reducedMotion]);
  return <PreferencesContext.Provider value={value}><MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>{children}</MotionConfig></PreferencesContext.Provider>;
}
export function useSitePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("SitePreferencesProvider is required");
  return value;
}
