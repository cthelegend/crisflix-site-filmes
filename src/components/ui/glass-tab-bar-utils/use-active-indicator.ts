import { useLayoutEffect, useState, type RefObject } from "react";

interface IndicatorRect { left: number; top: number; width: number; height: number }

export function useActiveIndicator(ref: RefObject<HTMLDivElement>, selector: string, value?: string) {
  const [rect, setRect] = useState<IndicatorRect | null>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;
    const measure = () => {
      const active = container.querySelector<HTMLElement>(selector);
      setRect(active ? {
        left: active.offsetLeft, top: active.offsetTop,
        width: active.offsetWidth, height: active.offsetHeight,
      } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    for (const link of container.querySelectorAll("a")) observer.observe(link);
    let mounted = true;
    document.fonts.ready.then(() => { if (mounted) measure(); });
    return () => { mounted = false; observer.disconnect(); };
  }, [ref, selector, value]);

  return rect;
}
