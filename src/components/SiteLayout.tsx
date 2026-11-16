import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useIsPresent } from "motion/react";
import { matchPath, Navigate, Routes, useLocation, type Location } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import BackgroundPattern from "./BackgroundPattern";
import Navbar from "./Navbar";
import SiteAnnouncements from "./SiteAnnouncements";
import { useSitePreferences } from "@/contexts/SitePreferencesContext";

const NavigationContext = createContext(false);
export const useHasNavigated = () => useContext(NavigationContext);

const navbarPaths = ["/", "/browse/:category", "/details/:type/:id", "/search", "/my-list", "/donate", "/quem-somos", "/futebol", "/biblioteca", "/termos", "/privacidade"];

function RoutePage({ children, location, reducedMotion }: { children: ReactNode; location: Location; reducedMotion: boolean }) {
  const present = useIsPresent();
  return (
    <m.div
      className="page-transition"
      data-page-path={location.pathname}
      data-page-phase={present ? "enter" : "exit"}
      aria-hidden={!present || undefined}
      {...(!present ? { inert: "" } : {})}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reducedMotion ? 1 : 0, transition: { duration: reducedMotion ? 0 : 0.14 } }}
      transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
      style={{ pointerEvents: present ? "auto" : "none" }}
    >
      <Routes location={location}>{children}</Routes>
    </m.div>
  );
}

export default function SiteLayout({ children }: { children: ReactNode }) {
  const { user, activeProfile, loading } = useAuth();
  const location = useLocation();
  const { reducedMotion } = useSitePreferences();
  const initialPath = useRef(location.pathname);
  const latestPath = useRef(location.pathname);
  latestPath.current = location.pathname;
  const [hasNavigated, setHasNavigated] = useState(false);
  const [navigationPath, setNavigationPath] = useState(location.pathname);
  const scopeKey = `${user?.id || "guest"}:${activeProfile?.id || "none"}`;
  const previousScope = useRef(scopeKey);
  useEffect(() => {
    if (previousScope.current !== scopeKey || ["/profile", "/auth", "/settings", "/cris"].includes(location.pathname)) {
      setNavigationPath(location.pathname);
      previousScope.current = scopeKey;
    }
  }, [scopeKey, location.pathname]);
  useEffect(() => {
    if (location.pathname !== initialPath.current) setHasNavigated(true);
  }, [location.pathname]);
  const showNavbar = navbarPaths.some((path) => matchPath({ path, end: true }, navigationPath));
  if (!loading && user && !activeProfile && !["/auth", "/profile", "/termos", "/privacidade", "/cris"].includes(location.pathname)) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <LazyMotion features={domAnimation}>
      <NavigationContext.Provider value={hasNavigated || location.pathname !== initialPath.current}>
        <div className="site-shell">
          <BackgroundPattern />
          {showNavbar && location.pathname !== "/cris" && <Navbar />}
          {showNavbar && location.pathname !== "/cris" && <SiteAnnouncements />}
          <div id="site-overlays" />
          <AnimatePresence key={scopeKey} initial={false} mode="wait" onExitComplete={() => {
            setNavigationPath(latestPath.current);
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          }}>
            <RoutePage key={location.pathname} location={location} reducedMotion={reducedMotion}>
              {children}
            </RoutePage>
          </AnimatePresence>
        </div>
      </NavigationContext.Provider>
    </LazyMotion>
  );
}
