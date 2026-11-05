"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  // Board percentages converted to a 10-point CGPA with the standard CGPA = % ÷ 9.5
  { period: "2019 – 2020", degree: "SSC (Class 10)", school: "Sri Chaitanya Techno School", gpa: 9.79, pct: "93%", detail: "Secondary School Certificate.", color: "#86d0a6" },
  { period: "2020 – 2022", degree: "Intermediate, MPC", school: "Narayana Junior College", gpa: 9.05, pct: "86%", detail: "Mathematics, physics and chemistry.", color: "#7cc7e8" },
  {
    period: "2022 – 2026",
    degree: "B.Tech, Computer Science",
    school: "Malla Reddy University, Hyderabad",
    gpa: 8.1,
    pct: undefined as string | undefined,
    detail: "Focus on backend systems, AI/ML and full-stack development.",
    color: "#f5b544",
    latest: true,
  },
];

// The path draws itself as you scroll, and each GPA counts up once in view.
export default function EducationPath() {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill.current,
        { scaleX: reduced ? 1 : 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 60%", scrub: 0.5 } }
      );
      gsap.utils.toArray<HTMLElement>("[data-gpa]").forEach((el) => {
        const target = Number(el.dataset.gpa);
        const decimals = el.dataset.gpa?.split(".")[1]?.length ?? 0;
        const o = { v: reduced ? target : 0 };
        el.textContent = o.v.toFixed(decimals);
        gsap.to(o, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => (el.textContent = o.v.toFixed(decimals)),
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      <h2 className="mb-3 text-4xl font-black text-white sm:text-5xl">Education</h2>
      <p className="mb-14 max-w-xl text-lg text-slate-300">From school to a computer science degree, graduating in 2026.</p>

      <div className="relative">
        {/* the path (desktop): fills left to right as you scroll */}
        <div className="absolute left-[16.6%] right-[16.6%] top-[11px] hidden h-px bg-white/10 lg:block" />
        <div ref={fill} className="absolute left-[16.6%] right-[16.6%] top-[11px] hidden h-px origin-left bg-[#f5b544] lg:block" />

        <ol className="grid gap-6 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.degree} data-testid={`edu-${i}`} className="relative flex flex-col items-start lg:items-center">
              <span
                className="z-10 mb-6 hidden h-[23px] w-[23px] place-items-center rounded-full border-2 bg-[#0a1020] lg:grid"
                style={{ borderColor: s.color }}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              </span>
              <div
                className={`w-full rounded-3xl border bg-[#131c2e] p-7 transition-transform duration-500 hover:-translate-y-1 ${s.latest ? "border-[#f5b544]/40" : "border-white/10"}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold" style={{ color: s.color }}>
                    {s.period}
                  </span>
                  {s.latest && <span className="rounded-full bg-[#f5b544]/15 px-2.5 py-0.5 text-xs font-semibold text-[#f5b544]">Graduating 2026</span>}
                </div>
                <h3 className="mb-1 text-2xl font-black text-white">{s.degree}</h3>
                <p className="mb-5 text-base text-slate-300">{s.school}</p>
                <div className="mb-4 flex items-baseline gap-1.5">
                  <span data-gpa={String(s.gpa)} className="font-display text-4xl font-black text-white">
                    {s.gpa}
                  </span>
                  <span className="text-base text-slate-400">/ 10 {s.pct ? "CGPA" : "GPA"}</span>
                </div>
                {s.pct && (
                  <p className="-mt-2 mb-4 text-sm text-slate-400">
                    {s.pct} on the board exam, converted at % ÷ 9.5
                  </p>
                )}
                <p className="text-sm leading-relaxed text-slate-300">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
