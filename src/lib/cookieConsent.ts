export const CONSENT_KEY = "foice-filme:cookie-consent:v1";
export const CONSENT_DURATION_MS = 180 * 24 * 60 * 60 * 1000;
export interface CookieConsent { version: 1; functional: boolean; decidedAt: number; expiresAt: number }
const functionalKeys = ["foice-filme:site-preferences:v1", "foice-filme:guest-progress:v2"];
const listeners = new Set<() => void>();
function removeFunctionalStorage() {
  try {
    const keys = [...functionalKeys];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("crisflix-tutorial-")) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  } catch { /* storage disabled */ }
}
function readConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw || raw.length > 512) return null;
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.functional !== "boolean" || !Number.isFinite(value.decidedAt)
      || !Number.isFinite(value.expiresAt) || value.expiresAt - value.decidedAt !== CONSENT_DURATION_MS
      || value.decidedAt > Date.now() + 60000) return null;
    if (value.expiresAt <= Date.now()) { removeFunctionalStorage(); localStorage.removeItem(CONSENT_KEY); return null; }
    return value;
  } catch { return null; }
}
let current = readConsent();
export const getCookieConsent = () => current;
export const canStoreFunctionalData = () => current?.functional === true && current.expiresAt > Date.now();
export function subscribeCookieConsent(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(value: CookieConsent | null) {
  current = value;
  listeners.forEach((listener) => listener());
}
export function chooseCookieConsent(functional: boolean) {
  const now = Date.now();
  const value: CookieConsent = { version: 1, functional, decidedAt: now, expiresAt: now + CONSENT_DURATION_MS };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(value)); } catch { /* choice applies to this visit */ }
  if (!functional) removeFunctionalStorage();
  publish(value);
}
export function refreshCookieConsent() { publish(readConsent()); }
export function openCookieChoices() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("open-cookie-choices"));
}
