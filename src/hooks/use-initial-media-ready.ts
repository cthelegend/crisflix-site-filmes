import { useEffect, useState, type RefObject } from "react";

const MAX_LOADING_MS = 15000;
const MAX_IMAGE_WAIT_MS = 6000;

function waitForImage(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      window.clearTimeout(timeout);
      image.removeEventListener("load", loaded);
      image.removeEventListener("error", finish);
      resolve();
    };
    const loaded = () => { void image.decode().catch(() => undefined).then(finish); };
    const timeout = window.setTimeout(finish, MAX_IMAGE_WAIT_MS);
    image.addEventListener("load", loaded, { once: true });
    image.addEventListener("error", finish, { once: true });
    if (image.complete) {
      if (image.naturalWidth) loaded();
      else finish();
    }
  });
}

/** Prepare the first screen, leaving offscreen posters lazy and avoiding an endless loader. */
export function useInitialMediaReady(content: RefObject<HTMLElement>, dataReady: boolean) {
  const [preparing, setPreparing] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (preparing) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(() => setShowLoader(false), reducedMotion ? 0 : 320);
    return () => window.clearTimeout(timeout);
  }, [preparing]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPreparing(false), MAX_LOADING_MS);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!preparing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [preparing]);

  useEffect(() => {
    if (!dataReady || !preparing) return;
    let cancelled = false;
    let frame = 0;

    // Let child rows commit their data before measuring the first screen.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        const root = content.current;
        if (!root || cancelled) return;
        const images = Array.from(root.querySelectorAll<HTMLImageElement>("img")).filter((image) => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight + 160 && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
        });
        images.forEach((image) => { image.loading = "eager"; });

        const backdropUrl = root.querySelector<HTMLElement>('[data-hero-backdrop="active"]')?.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
        const pending = images.map(waitForImage);
        if (backdropUrl) {
          const backdrop = new Image();
          backdrop.decoding = "async";
          backdrop.src = backdropUrl;
          pending.push(waitForImage(backdrop));
        }
        void Promise.allSettled(pending).then(() => {
          if (!cancelled) setPreparing(false);
        });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [content, dataReady, preparing]);

  return { preparing, showLoader };
}
