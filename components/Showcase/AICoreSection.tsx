"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import LazyStage from "./LazyStage";
import { layerDetail, openDetail } from "./detail";
import { LAYERS } from "../Universe/data";

const AICore3D = dynamic(() => import("./AICore3D"), { ssr: false });

// "How I build": the four-layer AI core in 3D, with plain-language cards
// beside it. Cards and 3D layers highlight each other; both open the popup.
export default function AICoreSection() {
  const [hl, setHl] = useState<number | null>(null);
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div>
        <h2 className="mb-4 text-4xl font-black text-white sm:text-5xl">An AI-powered backend, layer by layer.</h2>
        <p className="mb-8 max-w-xl text-lg leading-relaxed text-slate-300">
          Every system I ship moves data through the same four layers. Tap a layer — in 3D or below — to see the real work behind it.
        </p>
        <ol className="space-y-3">
          {LAYERS.map((L, i) => (
            <li key={L.name}>
              <button
                data-testid={`layer-card-${i}`}
                onMouseEnter={() => setHl(i)}
                onMouseLeave={() => setHl(null)}
                onFocus={() => setHl(i)}
                onBlur={() => setHl(null)}
                onClick={(e) => openDetail(layerDetail(i, { x: e.clientX, y: e.clientY }))}
                className={`group flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-300 ${
                  hl === i ? "translate-x-1 border-white/25 bg-white/[0.06]" : "border-white/10 bg-white/[0.02]"
                }`}
                style={hl === i ? { boxShadow: `0 0 40px -10px ${L.color}` } : undefined}
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-mono text-sm font-black"
                  style={{ background: `${L.color}1f`, color: L.color, border: `1px solid ${L.color}55` }}
                >
                  0{i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-white">
                    {L.name} <span className="font-normal text-slate-400">· {L.verb}</span>
                  </span>
                  <span className="block text-sm leading-snug text-slate-300 sm:text-base">{L.line}</span>
                </span>
                <ArrowUpRight size={20} className="shrink-0 text-slate-500 transition group-hover:text-white" />
              </button>
            </li>
          ))}
        </ol>
      </div>
      <LazyStage testId="ai-core-stage" className="relative order-first h-[420px] sm:h-[520px] lg:order-none lg:h-[600px]">
        {(visible) => <AICore3D visible={visible} hl={hl} setHl={setHl} />}
      </LazyStage>
    </div>
  );
}
