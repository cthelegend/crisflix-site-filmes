const PageLoadingScreen = ({ leaving = false }: { leaving?: boolean }) => (
  <div className={`page-loading-screen${leaving ? " is-leaving" : ""}`} role="status" aria-live="polite" aria-label="Carregando filmes e destaques" aria-hidden={leaving || undefined}>
    <div className="page-loading-emblem">
      <img src="/loading-emblem.gif" width="128" height="128" alt="" className="loading-animated" fetchPriority="high" />
      <img src="/hammer-sickle.png" width="128" height="128" alt="" className="loading-still" />
    </div>
    <p className="mt-5 text-[11px] font-medium tracking-[0.2em] text-white/55">Carregando<span className="loading-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></p>
  </div>
);

export default PageLoadingScreen;
