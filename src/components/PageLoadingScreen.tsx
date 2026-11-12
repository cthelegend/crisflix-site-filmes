import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsPresent } from "motion/react";
import { useHasNavigated } from "./SiteLayout";

const PageLoadingScreen = ({ leaving = false }: { leaving?: boolean }) => {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const hasNavigated = useHasNavigated();
  const present = useIsPresent();
  useLayoutEffect(() => { setTarget(document.getElementById("site-overlays") || document.body); }, []);
  if (!target) return null;
  return createPortal(
    <div className={`page-loading-screen${leaving || !present ? " is-leaving" : ""}${hasNavigated ? " is-page-loading" : ""}${!present ? " is-route-leaving" : ""}`} role="status" aria-live="polite" aria-label="Carregando filmes e destaques" aria-hidden={leaving || !present || undefined}>
      <div className="page-loading-emblem">
        <img src="/loading-emblem.gif" width="128" height="128" alt="" className="loading-animated" fetchPriority="high" />
        <img src="/hammer-sickle.png" width="128" height="128" alt="" className="loading-still" />
      </div>
      <p className="mt-5 text-[11px] font-medium tracking-[0.2em] text-white/55">Carregando<span className="loading-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
    </div>,
    target,
  );
};

export default PageLoadingScreen;
