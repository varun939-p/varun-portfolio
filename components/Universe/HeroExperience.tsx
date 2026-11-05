"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useDetail } from "../Showcase/detail";
import type { ProjectId } from "./data";

// WebGL only runs in the browser; skip SSR for the canvas.
const UniverseCanvas = dynamic(() => import("./UniverseCanvas"), { ssr: false });

export default function HeroExperience() {
  const [active, setActive] = useState<ProjectId | null>(null);
  const [hovered, setHovered] = useState<ProjectId | null>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const detail = useDetail();

  // the selected node's halo follows the popup: closing it deselects the node
  useEffect(() => {
    if (!detail) setActive(null);
  }, [detail]);

  return (
    <UniverseCanvas
      active={active}
      hovered={hovered}
      focusGroup={null}
      setActive={setActive}
      setHovered={setHovered}
      fpsRef={fpsRef}
    />
  );
}
