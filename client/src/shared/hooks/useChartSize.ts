import { useEffect, useRef, useState } from 'react';

interface ChartSize {
  width: number;
  height: number;
}

export function useChartSize<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ChartSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.max(1, Math.floor(rect.width)),
        height: Math.max(1, Math.floor(rect.height)),
      });
    };

    // Delay slightly to allow parent layout/animation to settle
    const timer = setTimeout(updateSize, 50);

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);

    window.addEventListener('resize', updateSize);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return { ref, ...size };
}
