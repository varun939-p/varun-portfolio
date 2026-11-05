"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Mounts a 3D stage only once it nears the viewport, and tells it whether it
// is actually on screen so the Canvas can stop rendering when scrolled away.
export default function LazyStage({
  className,
  children,
  testId,
}: {
  className?: string;
  children: (visible: boolean) => ReactNode;
  testId?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearIo = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "1200px 0px" });
    const visIo = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    nearIo.observe(el);
    visIo.observe(el);
    return () => {
      nearIo.disconnect();
      visIo.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className} data-testid={testId}>
      {near && children(visible)}
    </div>
  );
}
