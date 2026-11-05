"use client";

import { useSyncExternalStore } from "react";
import { JOBS, LAYERS, LIVE_DEMOS_ONLINE, PROJECTS, PROJECT_POINTS, SKILL_GROUPS, SKILL_PROOF, type ProjectId } from "../Universe/data";

// Content for the fullscreen popup. Any section opens one through openDetail().
export interface Detail {
  kicker: string;
  title: string;
  color: string;
  summary?: string;
  pointsLabel?: string;
  points?: string[];
  tags?: string[];
  links?: { label: string; href: string; primary?: boolean }[];
  image?: { src: string; url: string }; // real screenshot shown in a browser frame
  flow?: string[]; // animated "how it works" steps
  origin?: { x: number; y: number };
}

let current: Detail | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const openDetail = (d: Detail) => {
  current = d;
  emit();
};
export const closeDetail = () => {
  current = null;
  emit();
};
export const useDetail = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => current,
    () => null
  );

type Origin = Detail["origin"];

export const projectDetail = (id: ProjectId, origin?: Origin): Detail => {
  const p = PROJECTS.find((x) => x.id === id)!;
  const links: Detail["links"] = [];
  if (p.href && LIVE_DEMOS_ONLINE) links.push({ label: "Open live demo", href: p.href, primary: true });
  if (p.repo) links.push({ label: "View code on GitHub", href: p.repo, primary: !(p.href && LIVE_DEMOS_ONLINE) });
  if (!links.length) links.push({ label: "Read the project write-up", href: "#projects", primary: true });
  return {
    kicker: `${p.short}, ${p.date.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}`,
    title: p.title,
    color: p.color,
    summary: p.summary,
    image: p.image ? { src: p.image, url: (p.href ?? p.repo ?? "").replace(/^https?:\/\//, "") } : undefined,
    flow: p.flow,
    pointsLabel: "What I built",
    points: PROJECT_POINTS[id],
    tags: p.stack,
    links,
    origin,
  };
};

export const skillDetail = (i: number, origin?: Origin): Detail => {
  const g = SKILL_GROUPS[i];
  return {
    kicker: `${g.items.length} tools I use`,
    title: g.name,
    color: g.color,
    pointsLabel: "Where I've used it",
    points: SKILL_PROOF[i],
    tags: g.items,
    origin,
  };
};

export const layerDetail = (i: number, origin?: Origin): Detail => {
  const l = LAYERS[i];
  return {
    kicker: `Step ${i + 1} of ${LAYERS.length}: ${l.verb.toLowerCase()}`,
    title: `${l.name} layer`,
    color: l.color,
    summary: l.line,
    pointsLabel: "Proof from real work",
    points: l.proof,
    tags: l.tools,
    origin,
  };
};

export const jobDetail = (id: string, origin?: Origin): Detail => {
  const j = JOBS.find((x) => x.id === id)!;
  return {
    kicker: `${j.dates}, ${j.place}`,
    title: `${j.role} at ${j.company}`,
    color: j.color,
    summary: j.impact,
    pointsLabel: "What I did",
    points: j.points,
    tags: j.tags,
    origin,
  };
};
