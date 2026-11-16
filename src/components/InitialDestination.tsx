import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSitePreferences } from "@/contexts/SitePreferencesContext";
import { preferredStartPath } from "@/lib/sitePreferences";
import PageLoadingScreen from "./PageLoadingScreen";

/** Apply the preference only on arrival; the Início link must still open home. */
export default function InitialDestination({ children }: { children: ReactNode }) {
  const location = useLocation();
  const initialPath = useRef(location.pathname);
  const [ready, setReady] = useState(location.pathname !== "/");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { preferences } = useSitePreferences();
  useEffect(() => {
    if (ready || loading) return;
    if (initialPath.current !== "/" || location.pathname !== "/") { setReady(true); return; }
    const destination = preferredStartPath(preferences.startPage, !!user);
    if (destination !== "/") navigate(destination, { replace: true });
    else setReady(true);
  }, [loading, user?.id, location.pathname, preferences.startPage, navigate, ready]);
  return ready ? <>{children}</> : <PageLoadingScreen />;
}
