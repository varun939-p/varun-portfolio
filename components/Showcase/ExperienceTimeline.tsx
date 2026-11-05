"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { JOBS, type Job } from "../Universe/data";
import { jobDetail, openDetail } from "./detail";
import { FleetMap, ValidationGraphic } from "./StoryGraphics";

gsap.registerPlugin(ScrollTrigger);

export default function ExperienceTimeline() {
  const list = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!list.current) return;
    const ctx = gsap.context(() => {
      // the rail fills as you read down the timeline
      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 65%", end: "bottom 65%", scrub: 0.5 } }
      );
      gsap.utils.toArray<HTMLElement>("[data-job]").forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: "top 65%", toggleClass: { targets: el, className: "is-active" } });
      });
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
      <div className="self-start lg:sticky lg:top-28">
        <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">Experience</h2>
        <p className="max-w-sm text-lg leading-relaxed text-slate-300">
          Two internships where my code ran against real production data. Open either one for the details.
        </p>
      </div>

      <div ref={list} className="relative">
        <div className="absolute bottom-3 left-[11px] top-3 w-px bg-white/10" />
        <div ref={fill} className="absolute bottom-3 left-[11px] top-3 w-px origin-top bg-[#f5b544]" />
        {JOBS.map((j) => (
          <JobEntry key={j.id} job={j} />
        ))}
      </div>
    </div>
  );
}

function JobEntry({ job }: { job: Job }) {
  const open = (e: React.MouseEvent) => openDetail(jobDetail(job.id, { x: e.clientX, y: e.clientY }));
  return (
    <article data-job className="job-entry relative pb-20 pl-12 last:pb-0">
      <span className="job-dot absolute left-0 top-1.5 grid h-[23px] w-[23px] place-items-center rounded-full border-2 border-white/20 bg-[#0a1020]">
        <span className="h-2 w-2 rounded-full bg-white/30" />
      </span>

      <p className="mb-1 text-sm text-slate-400">
        {job.dates}, {job.place}
      </p>
      <h3 className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl font-black text-white sm:text-3xl">
        <span>
          {job.role} <span className="text-slate-400">at</span> {job.company}
        </span>
        {job.current && (
          <span className="rounded-full border border-[#86d0a6]/40 bg-[#86d0a6]/10 px-2.5 py-0.5 text-xs font-semibold text-[#86d0a6]" style={{ fontFamily: "var(--font-sans)" }}>
            Current
          </span>
        )}
      </h3>
      <p className="mb-7 max-w-[60ch] text-lg leading-relaxed text-slate-300">{job.impact}</p>

      <div className="grid gap-5 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1424]">
          {job.id === "ezinore" ? <FleetMap /> : <ValidationGraphic />}
        </div>
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#131c2e] p-6">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-1">
            {job.metrics.map((m) => (
              <div key={m.label}>
                <dt className="sr-only">{m.label}</dt>
                <dd className="font-display text-3xl font-black text-white">{m.value}</dd>
                <dd className="text-sm text-slate-400">{m.label}</dd>
              </div>
            ))}
          </dl>
          <button
            onClick={open}
            data-testid={`job-${job.id}`}
            className="flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[#0a1020] transition hover:brightness-110"
            style={{ background: job.color }}
          >
            See what I did <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
