"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, Database, Layers, Workflow, Wrench, type LucideIcon } from "lucide-react";
import LazyStage from "./LazyStage";
import { openDetail, skillDetail } from "./detail";
import { SKILL_GROUPS, SKILL_PROOF } from "../Universe/data";

gsap.registerPlugin(ScrollTrigger);

const SkillOrbs3D = dynamic(() => import("./SkillOrbs3D"), { ssr: false });
const ICONS: LucideIcon[] = [Database, Brain, Layers, Wrench, Workflow];

// every tool, tagged with the skill group it belongs to
const TOOLS = SKILL_GROUPS.flatMap((g, gi) => g.items.map((name) => ({ name, gi, color: g.color })));
const ROW_A = TOOLS.filter((t) => t.gi <= 1);
const ROW_B = TOOLS.filter((t) => t.gi >= 2);

export default function SkillsSection() {
  const grid = useRef<HTMLDivElement>(null);

  // one orchestrated reveal: pads cascade in as the grid scrolls into view
  useEffect(() => {
    if (!grid.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-pad]",
        { y: 48, autoAlpha: 0, rotateX: 8 },
        { y: 0, autoAlpha: 1, rotateX: 0, duration: 0.9, ease: "power3.out", stagger: 0.09, scrollTrigger: { trigger: grid.current, start: "top 82%", once: true } }
      );
    }, grid);
    return () => ctx.revert();
  }, []);

  return (
    <div>
      <div className="mb-10 flex flex-col items-start">
        <h2 className="mb-3 text-4xl font-black text-white sm:text-5xl">What I work with</h2>
        <p className="max-w-xl text-lg text-slate-300">
          The tools I ship with every week. Hover a row to stop it, and click any tool, orb or card to see where I&apos;ve used it.
        </p>
      </div>

      {/* two rows of tools gliding in opposite directions */}
      <div className="mb-14 space-y-3" data-testid="tool-marquee">
        <Marquee items={ROW_A} duration={46} />
        <Marquee items={ROW_B} duration={52} reverse />
      </div>

      <LazyStage testId="skills-stage" className="relative mx-auto mb-16 h-[540px] max-w-6xl sm:h-[440px]">
        {(visible) => <SkillOrbs3D visible={visible} />}
      </LazyStage>

      {/* large, scannable pads — readable without touching the 3D */}
      <div ref={grid} className="grid gap-6 [perspective:1200px] md:grid-cols-2 xl:grid-cols-3">
        {SKILL_GROUPS.map((g, i) => {
          const Icon = ICONS[i];
          return (
            <button
              key={g.name}
              data-pad
              data-testid={`skill-pad-${i}`}
              onClick={(e) => openDetail(skillDetail(i, { x: e.clientX, y: e.clientY }))}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
              className={`skill-pad group relative flex flex-col items-stretch overflow-hidden rounded-3xl border border-white/10 bg-[#131c2e] p-8 text-left transition-[border-color,transform] duration-500 hover:-translate-y-1.5 hover:border-white/25 ${
                i === SKILL_GROUPS.length - 1 ? "md:col-span-2 xl:col-span-1" : ""
              }`}
              style={{ "--c": g.color } as React.CSSProperties}
            >
              <div className="mb-6 flex items-center gap-4">
                <span
                  className="grid h-14 w-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110"
                  style={{ background: `${g.color}1f`, color: g.color, border: `1px solid ${g.color}55` }}
                >
                  <Icon size={28} />
                </span>
                <div>
                  <h3 className="text-2xl font-black text-white">{g.name}</h3>
                  <p className="text-sm text-slate-400">{g.items.length} tools</p>
                </div>
              </div>
              <div className="mb-6 flex flex-wrap gap-2.5">
                {g.items.map((s) => (
                  <span
                    key={s}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-base font-semibold text-slate-100 transition-colors duration-300 group-hover:border-white/25 group-hover:bg-white/[0.07]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-auto border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-300">
                <span className="font-bold" style={{ color: g.color }}>
                  Used in:{" "}
                </span>
                {SKILL_PROOF[i][0]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Marquee({ items, duration, reverse = false }: { items: typeof TOOLS; duration: number; reverse?: boolean }) {
  const half = (copy: boolean) => (
    <div className="flex shrink-0 gap-3 pr-3" aria-hidden={copy || undefined}>
      {items.map((t) => (
        <button
          key={`${t.name}-${copy}`}
          tabIndex={copy ? -1 : 0}
          onClick={(e) => openDetail(skillDetail(t.gi, { x: e.clientX, y: e.clientY }))}
          className="group flex items-center gap-2.5 whitespace-nowrap rounded-full border border-white/10 bg-[#131c2e] px-5 py-2.5 text-base font-medium text-slate-100 transition-colors duration-300 hover:border-white/30 hover:text-white"
        >
          <span className="h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
          {t.name}
        </button>
      ))}
    </div>
  );
  return (
    <div className="marquee overflow-hidden">
      <div className={`marquee-track flex w-max ${reverse ? "marquee-track--reverse" : ""}`} style={{ "--dur": `${duration}s` } as React.CSSProperties}>
        {half(false)}
        {half(true)}
      </div>
    </div>
  );
}
