import { useSyncExternalStore } from "react";
import { getCookieConsent, subscribeCookieConsent } from "@/lib/cookieConsent";
export const useCookieConsent = () => useSyncExternalStore(subscribeCookieConsent, getCookieConsent, () => null);
