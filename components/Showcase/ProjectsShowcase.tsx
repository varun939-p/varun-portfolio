"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "../Universe/data";
import { openDetail, projectDetail } from "./detail";

// Projects glide past continuously (Embla + Auto Scroll). Hovering or
// focusing pauses the track; clicking a card opens the full project.
export default function ProjectsShowcase() {
  const wrap = useRef<HTMLDivElement>(null);
  const [emblaRef, api] = useEmblaCarousel({ loop: true, dragFree: true, align: "start" }, [
    AutoScroll({ speed: 0.7, startDelay: 300, stopOnMouseEnter: true, stopOnInteraction: false, stopOnFocusIn: true, playOnInit: false }),
  ]);

  // only move while on screen, never for people who prefer reduced motion
  useEffect(() => {
    if (!api || !wrap.current) return;
    const auto = api.plugins().autoScroll;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduced) auto.play();
      else auto.stop();
    });
    io.observe(wrap.current);
    return () => {
      io.disconnect();
    };
  }, [api]);


  // three projects twice over, so the loop never shows a gap on wide screens
  const slides = [...PROJECTS, ...PROJECTS];

  return (
    <div ref={wrap}>
      <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-20 lg:px-28">
        <div>
          <h2 className="mb-3 text-4xl font-black text-white sm:text-5xl">Project work</h2>
          <p className="max-w-xl text-lg text-slate-300">
            Three systems I designed, built and shipped end to end. Hover a project to stop it, then click to see the real product.
          </p>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef} data-testid="projects-carousel">
        <div className="flex touch-pan-y">
          {slides.map((p, i) => (
            <div key={`${p.id}-${i}`} className="min-w-0 shrink-0 grow-0 basis-[88%] pl-5 sm:basis-[62%] lg:basis-[44%] xl:basis-[38%]">
              <ProjectCard
                p={p}
                dup={i >= PROJECTS.length}
                onOpen={(x, y) => {
                  // Embla v8 swallows the click that ends a drag, so this only fires on real clicks
                  openDetail(projectDetail(p.id, { x, y }));
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p, dup, onOpen }: { p: Project; dup: boolean; onOpen: (x: number, y: number) => void }) {
  return (
    <button
      type="button"
      data-testid={dup ? undefined : `project-card-${p.id}`}
      aria-hidden={dup || undefined}
      tabIndex={dup ? -1 : 0}
      onClick={(e) => onOpen(e.clientX, e.clientY)}
      className="group block w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#131c2e] text-left transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ outlineColor: p.color }}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#0d1424]">
        {p.image ? (
          <Image
            src={p.image}
            alt={`${p.title} — screenshot of the running app`}
            fill
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 62vw, 560px"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <PipelinePreview color={p.color} />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#131c2e] to-transparent" />
        <span className="absolute bottom-4 left-4 flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0a1020] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          Click to open <ArrowUpRight size={15} />
        </span>
      </div>
      <div className="p-6 sm:p-7">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold" style={{ color: p.color }}>
            {p.short}
          </span>
          <span className="text-slate-400">{p.date.charAt(0) + p.date.slice(1).toLowerCase()}</span>
        </div>
        <h3 className="mb-2 text-2xl font-black text-white">{p.title}</h3>
        <p className="mb-5 text-base leading-relaxed text-slate-300">{p.outcome}</p>
        <div className="flex flex-wrap gap-2">
          {p.stack.slice(0, 4).map((t) => (
            <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200">
              {t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// The job pipeline has no UI of its own (it runs as scheduled workflows), so
// its card shows the pipeline itself: postings stream in, the LLM filter
// drops spam, and matches pass through to Telegram.
function PipelinePreview({ color }: { color: string }) {
  const rows = ["Backend Engineer, Hyderabad", "Python Developer, Remote", "Earn $$$ fast — no skills", "AI/ML Engineer, Bengaluru", "FastAPI Developer, Pune"];
  return (
    <div className="pipeline-preview absolute inset-0 overflow-hidden" style={{ "--c": color } as React.CSSProperties}>
      <div className="absolute inset-y-6 left-[52%] w-px bg-white/15" />
      <div className="absolute left-[52%] top-5 -translate-x-1/2 rounded-full border border-white/15 bg-[#131c2e] px-3 py-1 text-xs font-semibold text-slate-200">
        Groq relevance filter
      </div>
      {rows.map((r, i) => (
        <div key={r} className="pipeline-track" style={{ top: `${20 + i * 14}%`, animationDelay: `${i * -1.3}s` }}>
          <span
            className={`pipeline-row inline-block whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium ${
              i === 2 ? "pipeline-row--spam border-[#ee8b6f]/40 text-[#ee8b6f]" : "border-white/10 bg-[#131c2e] text-slate-200"
            }`}
            style={{ animationDelay: `${i * -1.3}s` }}
          >
            {r}
          </span>
        </div>
      ))}
    </div>
  );
}
