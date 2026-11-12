import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, LazyMotion, domAnimation, m, useIsPresent, useReducedMotion } from "motion/react";
import { matchPath, Routes, useLocation, type Location } from "react-router-dom";
import BackgroundPattern from "./BackgroundPattern";
import Navbar from "./Navbar";

const NavigationContext = createContext(false);
export const useHasNavigated = () => useContext(NavigationContext);

const navbarPaths = ["/", "/browse/:category", "/details/:type/:id", "/search", "/my-list", "/donate", "/quem-somos", "/futebol"];

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
  const location = useLocation();
  const reducedMotion = useReducedMotion() ?? false;
  const initialPath = useRef(location.pathname);
  const latestPath = useRef(location.pathname);
  latestPath.current = location.pathname;
  const [hasNavigated, setHasNavigated] = useState(false);
  const [navigationPath, setNavigationPath] = useState(location.pathname);
  useEffect(() => {
    if (location.pathname !== initialPath.current) setHasNavigated(true);
  }, [location.pathname]);
  const showNavbar = navbarPaths.some((path) => matchPath({ path, end: true }, navigationPath));

  return (
    <LazyMotion features={domAnimation}>
      <NavigationContext.Provider value={hasNavigated || location.pathname !== initialPath.current}>
        <div className="site-shell">
          <BackgroundPattern />
          {showNavbar && <Navbar />}
          <div id="site-overlays" />
          <AnimatePresence initial={false} mode="wait" onExitComplete={() => {
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
