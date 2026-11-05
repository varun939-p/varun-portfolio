"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

const CERTS = [
  {
    title: "Google IT Automation with Python",
    kind: "Professional Certificate",
    issuer: "Google",
    via: "Coursera",
    year: "2025",
    mark: "G",
    color: "#7cc7e8",
    covers: ["Python scripting", "Git & GitHub", "Bash", "IT automation", "Working with APIs"],
    href: "https://www.coursera.org/professional-certificates/google-it-automation",
  },
  {
    title: "Python Data Representations",
    kind: "Course",
    issuer: "Rice University",
    via: "Coursera",
    year: "2024",
    mark: "R",
    color: "#f5b544",
    covers: ["Data structures", "File handling", "String processing", "Representing data"],
    href: "https://www.coursera.org/learn/python-representation",
  },
];

// Credential cards: the seal draws itself and a light sweep crosses the card
// once when the section scrolls into view.
export default function CredentialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="credentials">
      <h2 className="mb-3 text-4xl font-black text-white sm:text-5xl">Certifications</h2>
      <p className="mb-12 max-w-xl text-lg text-slate-300">Coursework behind the tools I use every day.</p>
      <div className="grid gap-6 lg:grid-cols-2">
        {CERTS.map((c, i) => (
          <article
            key={c.title}
            data-testid={`cert-${i}`}
            className="cert-card group relative flex gap-6 overflow-hidden rounded-3xl border border-white/10 bg-[#131c2e] p-7 sm:p-9"
            style={{ "--c": c.color, "--d": `${i * 0.25}s` } as React.CSSProperties}
          >
            <Seal mark={c.mark} color={c.color} />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-semibold" style={{ color: c.color }}>
                {c.kind}, {c.year}
              </p>
              <h3 className="mb-1 text-2xl font-black leading-tight text-white">{c.title}</h3>
              <p className="mb-5 text-base text-slate-300">
                {c.issuer}, through {c.via}
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {c.covers.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-200">
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-base font-semibold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-[color:var(--c)]"
              >
                View the course on Coursera <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Seal({ mark, color }: { mark: string; color: string }) {
  return (
    <svg viewBox="0 0 96 96" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" aria-hidden="true">
      <g className="seal-spin" style={{ transformOrigin: "48px 48px" }}>
        <circle cx="48" cy="48" r="44" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="2 5" />
      </g>
      <circle className="seal-draw" cx="48" cy="48" r="36" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" pathLength={1} transform="rotate(-90 48 48)" />
      <circle cx="48" cy="48" r="29" fill={color} fillOpacity="0.12" />
      <text x="48" y="57" textAnchor="middle" fontSize="26" fontWeight="800" fill={color} style={{ fontFamily: "var(--font-display)" }}>
        {mark}
      </text>
    </svg>
  );
}
