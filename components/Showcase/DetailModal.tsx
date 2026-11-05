"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Check, Github, X } from "lucide-react";
import { closeDetail, useDetail, type Detail } from "./detail";
import FlowDiagram from "./FlowDiagram";

// Fullscreen popup that bursts open from the point the user tapped.
export default function DetailModal() {
  const detail = useDetail();
  const [shown, setShown] = useState<Detail | null>(null);
  const [open, setOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (detail) {
      setShown(detail);
      // short timer (not rAF) so the clip-path transition starts from its
      // collapsed state even when the tab's frame rate is throttled
      const id = setTimeout(() => setOpen(true), 30);
      return () => clearTimeout(id);
    }
    setOpen(false);
    const t = setTimeout(() => setShown(null), 450);
    return () => clearTimeout(t);
  }, [detail]);

  useEffect(() => {
    if (!detail) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDetail();
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [detail]);

  if (!shown) return null;
  const o = shown.origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const c = shown.color;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shown.title}
      data-testid="detail-modal"
      onClick={closeDetail}
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a1020]/85 px-4 py-10 backdrop-blur-xl sm:px-6 sm:py-16"
      style={{
        clipPath: `circle(${open ? 150 : 0}% at ${o.x}px ${o.y}px)`,
        transition: "clip-path 0.6s cubic-bezier(0.7, 0, 0.2, 1)",
        backgroundImage: `radial-gradient(circle at ${o.x}px ${o.y}px, ${c}26, transparent 55%)`,
      }}
    >
      <article
        onClick={(e) => e.stopPropagation()}
        className={`relative mx-auto w-full rounded-[28px] border border-white/10 bg-[#111a2b] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 ${
          shown.image || shown.flow ? "max-w-5xl" : "max-w-3xl"
        } ${open ? "translate-y-0 opacity-100 delay-150" : "translate-y-6 opacity-0"}`}
      >
        <button
          ref={closeBtn}
          onClick={closeDetail}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 rounded-full border border-white/15 bg-[#111a2b]/90 p-2.5 text-slate-200 transition hover:border-white/40 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* real product screenshot in a browser frame */}
        {shown.image && (
          <div className="overflow-hidden rounded-t-[28px] border-b border-white/10 bg-[#0d1424]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 pr-16">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ee8b6f]" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#f5b544]" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#86d0a6]" />
              <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-1 font-mono text-xs text-slate-400">{shown.image.url}</span>
            </div>
            <div className="relative aspect-[16/10] w-full">
              <Image src={shown.image.src} alt={`${shown.title} screenshot`} fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover object-top" />
            </div>
          </div>
        )}

        <div className="p-7 sm:p-12">
          <p className="mb-2 text-sm font-semibold" style={{ color: c }}>
            {shown.kicker}
          </p>
          <h3 className="mb-5 pr-12 text-4xl font-black leading-[1.05] text-white sm:text-5xl">{shown.title}</h3>
          {shown.summary && <p className="mb-8 max-w-[65ch] text-lg leading-relaxed text-slate-200">{shown.summary}</p>}

          {shown.flow && <FlowDiagram label="How it works" color={c} steps={shown.flow} />}

          {shown.points && (
            <>
              <h4 className="mb-3 text-base font-bold text-white">{shown.pointsLabel}</h4>
              <ul className="mb-8 space-y-3">
                {shown.points.map((p) => (
                  <li key={p} className="flex gap-3.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-base leading-relaxed text-slate-100">
                    <span className="mt-0.5 shrink-0 self-start rounded-full p-1" style={{ background: `${c}22`, color: c }}>
                      <Check size={16} strokeWidth={3} />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </>
          )}

          {shown.tags && (
            <div className="mb-8 flex flex-wrap gap-2">
              {shown.tags.map((t) => (
                <span key={t} className="rounded-full border px-3.5 py-1.5 text-sm text-white" style={{ borderColor: `${c}55`, background: `${c}14` }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {shown.links && (
            <div className="flex flex-wrap gap-3">
              {shown.links.map((l) => {
                const ext = l.href.startsWith("http");
                const gh = l.href.includes("github.com");
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => !ext && closeDetail()}
                    {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}
                    className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition ${
                      l.primary ? "text-[#0a1020] hover:brightness-110" : "border border-white/20 text-white hover:border-white/50"
                    }`}
                    style={l.primary ? { background: c } : undefined}
                  >
                    {gh && <Github size={18} />}
                    {l.label}
                    {!gh && <ArrowUpRight size={18} />}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
