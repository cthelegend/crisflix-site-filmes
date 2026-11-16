import { canStoreFunctionalData, getCookieConsent, subscribeCookieConsent } from "@/lib/cookieConsent";
export interface SitePreferences {
  motion: "system" | "full" | "reduced";
  rotateHighlights: boolean;
  cardSize: "compact" | "comfortable";
  textSize: "standard" | "large";
  saveData: boolean;
  startPage: "home" | "my-list" | "library";
}
export const PREFERENCES_KEY = "foice-filme:site-preferences:v1";
export const DEFAULT_PREFERENCES: SitePreferences = {
  motion: "system", rotateHighlights: true, cardSize: "compact",
  textSize: "standard", saveData: false, startPage: "home",
};
export function normalizePreferences(input: unknown): SitePreferences {
  const value = input && typeof input === "object" ? input as Partial<SitePreferences> : {};
  return {
    motion: ["system", "full", "reduced"].includes(value.motion) ? value.motion : "system",
    rotateHighlights: typeof value.rotateHighlights === "boolean" ? value.rotateHighlights : true,
    cardSize: value.cardSize === "comfortable" ? "comfortable" : "compact",
    textSize: value.textSize === "large" ? "large" : "standard",
    saveData: value.saveData === true,
    startPage: ["home", "my-list", "library"].includes(value.startPage) ? value.startPage : "home",
  };
}
function readStoredPreferences(): SitePreferences {
  if (!canStoreFunctionalData()) return { ...DEFAULT_PREFERENCES };
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    return raw && raw.length < 2048 ? normalizePreferences(JSON.parse(raw)) : { ...DEFAULT_PREFERENCES };
  } catch { return { ...DEFAULT_PREFERENCES }; }
}
let current = readStoredPreferences();
let changedThisVisit = false;
const listeners = new Set<() => void>();
export const getSitePreferences = () => current;
export function subscribePreferences(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(next: SitePreferences) {
  if (JSON.stringify(current) === JSON.stringify(next)) return;
  current = next;
  listeners.forEach((listener) => listener());
}
export function updateSitePreferences(patch: Partial<SitePreferences>) {
  changedThisVisit = true;
  const next = normalizePreferences({ ...current, ...patch });
  try { if (canStoreFunctionalData()) localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next)); } catch { /* preferences still work for this visit */ }
  publish(next);
}
export function resetSitePreferences() {
  changedThisVisit = true;
  try { localStorage.removeItem(PREFERENCES_KEY); } catch { /* storage unavailable */ }
  publish({ ...DEFAULT_PREFERENCES });
}
export function syncStoredPreferences() { if (canStoreFunctionalData()) publish(readStoredPreferences()); }
subscribeCookieConsent(() => {
  if (!canStoreFunctionalData()) {
    changedThisVisit = true;
    if (getCookieConsent()?.functional === false) try { localStorage.removeItem(PREFERENCES_KEY); } catch { /* storage unavailable */ }
    return;
  }
  if (!changedThisVisit) publish(readStoredPreferences());
  try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(current)); } catch { /* storage unavailable */ }
});
export function preferredStartPath(startPage: SitePreferences["startPage"], signedIn: boolean) {
  if (startPage === "library") return "/biblioteca";
  return startPage === "my-list" && signedIn ? "/my-list" : "/";
}
export function catalogImageUrl(value: string | null | undefined): string | undefined {
  if (!value || !current.saveData) return value || undefined;
  try {
    const url = new URL(value);
    if (url.origin === "https://image.tmdb.org") url.pathname = url.pathname.replace(/^\/t\/p\/(?:original|w\d+)\//, "/t/p/w185/");
    return url.href;
  } catch { return value; }
}
