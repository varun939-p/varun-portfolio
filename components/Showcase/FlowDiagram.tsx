// Animated architecture flow: data packets travel left→right while each stage
// lights up as a packet reaches it. Pure CSS transforms (compositor-only).
export default function FlowDiagram({ steps, color, label }: { steps: string[]; color: string; label: string }) {
  const dur = 3.2;
  return (
    <figure
      aria-label={`${label}: ${steps.join(" → ")}`}
      className="mb-6 rounded-2xl border border-white/10 bg-black/30 px-4 pb-4 pt-5 sm:px-6"
      style={{ "--flow": color, "--flow-dur": `${dur}s` } as React.CSSProperties}
    >
      <figcaption className="mb-4 text-sm font-semibold text-slate-300">{label}</figcaption>
      <div className="relative">
        {/* track */}
        <div className="absolute left-[10%] right-[10%] top-[15px] h-px bg-white/15" />
        <div className="absolute left-[10%] right-[10%] top-[15px] h-px overflow-hidden">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flow-packet" style={{ animationDelay: `${(-dur / 3) * i}s` }}>
              <i />
            </span>
          ))}
        </div>
        <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => (
            <li key={s} className="flex flex-col items-center gap-2 text-center">
              <span
                className="flow-node grid h-[31px] w-[31px] place-items-center rounded-full border font-mono text-[11px] font-bold text-white"
                style={{ animationDelay: `${(dur * i) / (steps.length - 1) - dur * 1.08}s` }}
              >
                {i + 1}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-slate-200 sm:text-xs">{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
