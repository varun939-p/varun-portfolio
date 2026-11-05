"use client";

import { useEffect, useRef } from "react";

// Story graphics for the experience timeline. Everything is SMIL, so one
// pauseAnimations() call freezes every layer while the graphic is off screen.
function useSmilPause() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting && !reduced ? svg.unpauseAnimations() : svg.pauseAnimations()));
    svg.pauseAnimations();
    io.observe(svg);
    return () => io.disconnect();
  }, []);
  return ref;
}

const D = "8s";
const KT = "0;0.22;0.34;0.6;0.7;1";
const ROAD_A = "M10 160 C60 150 90 110 130 108 S180 70 196 40";
const ROAD_B = "M14 60 C60 70 100 60 140 90 S170 150 190 170";
const DRIFT_X = "150;150;276;276;150;150";
const DRIFT_Y = "96;96;70;70;96;96";

// Ezinore: the multipath story. A satellite fix reaches the truck directly and,
// bounced off a building, a second time; the reflected signal drags the raw GPS
// position 30 km out to sea, then the drift-correction layer snaps it back.
export function FleetMap() {
  const ref = useSmilPause();
  return (
    <svg ref={ref} viewBox="0 0 320 200" className="block h-full w-full" role="img" aria-label="Fleet map: a reflected GPS signal drags one truck's position offshore, then the drift-correction layer snaps it back onto the road">
      <defs>
        <radialGradient id="fm-sweep" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 96) scale(30)">
          <stop offset="0" stopColor="#7cc7e8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#7cc7e8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fm-drift" x1="150" y1="96" x2="276" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ee8b6f" stopOpacity="0" />
          <stop offset="1" stopColor="#ee8b6f" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="#121c30" />
      <path d="M212 0 C190 40 236 78 206 118 S226 172 214 200 L320 200 L320 0 Z" fill="#0b1626" />
      {/* swells moving across the sea */}
      {[40, 90, 140].map((y, k) => (
        <path key={y} d={"M226 " + y + " q12 -5 24 0 t24 0 t24 0 t24 0"} fill="none" stroke="#7cc7e8" strokeOpacity="0.16" strokeWidth="1" strokeDasharray="10 8">
          <animate attributeName="stroke-dashoffset" from="0" to="-36" dur={3 + k + "s"} repeatCount="indefinite" />
        </path>
      ))}
      <g stroke="#ffffff" strokeOpacity="0.05">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} />
        ))}
      </g>

      {/* roads with glowing traffic pulses (stacked strokes = cheap glow) */}
      {[ROAD_A, ROAD_B].map((d, k) => (
        <g key={k}>
          <path d={d} fill="none" stroke="#2c3d5e" strokeWidth="3" strokeLinecap="round" />
          <path d={d} fill="none" stroke="#7cc7e8" strokeOpacity="0.18" strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray="0.08 0.92">
            <animate attributeName="stroke-dashoffset" from="0" to="-1" dur={3.4 + k + "s"} repeatCount="indefinite" />
          </path>
          <path d={d} fill="none" stroke="#bfe6f6" strokeWidth="1.6" strokeLinecap="round" pathLength={1} strokeDasharray="0.05 0.95">
            <animate attributeName="stroke-dashoffset" from="0" to="-1" dur={3.4 + k + "s"} repeatCount="indefinite" />
          </path>
        </g>
      ))}

      {/* the building that reflects the signal */}
      <rect x="104" y="30" width="16" height="34" rx="2" fill="#1d2a45" stroke="#7cc7e8" strokeOpacity="0.35" />
      {[36, 44, 52].map((y) => (
        <rect key={y} x="108" y={y} width="8" height="3" fill="#7cc7e8" fillOpacity="0.25" />
      ))}

      {/* satellite */}
      <g transform="translate(34 22)">
        <rect x="-4" y="-4" width="8" height="8" rx="1.5" fill="#eef2f8" />
        <rect x="-15" y="-2.5" width="9" height="5" fill="#7cc7e8" fillOpacity="0.8" />
        <rect x="6" y="-2.5" width="9" height="5" fill="#7cc7e8" fillOpacity="0.8" />
      </g>
      {/* direct signal */}
      <line x1="34" y1="26" x2="150" y2="96" stroke="#7cc7e8" strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="3 4">
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.9s" repeatCount="indefinite" />
      </line>
      {/* reflected signal (multipath), only during the drift */}
      <polyline points="34,26 112,40 150,96" fill="none" stroke="#ee8b6f" strokeWidth="1.3" strokeDasharray="3 4" opacity="0">
        <animate attributeName="opacity" values="0;0;0.95;0.95;0;0" keyTimes={KT} dur={D} repeatCount="indefinite" />
        <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="0.9s" repeatCount="indefinite" />
      </polyline>

      {/* fleet trucks with soft glow */}
      {[0, 2.6, 5.2].map((b, i) => (
        <g key={i}>
          <circle r="9" fill="#7cc7e8" fillOpacity="0.14" />
          <circle r="3.8" fill="#7cc7e8" />
          <animateMotion dur="7.8s" begin={"-" + b + "s"} repeatCount="indefinite" path={i === 1 ? ROAD_B : ROAD_A} />
        </g>
      ))}

      {/* radar sweep: GPS lock on the tracked truck */}
      <path d="M150 96 L180 88 A31 31 0 0 1 180 104 Z" fill="url(#fm-sweep)">
        <animateTransform attributeName="transform" type="rotate" from="0 150 96" to="360 150 96" dur="2.6s" repeatCount="indefinite" />
      </path>
      <circle cx="150" cy="96" r="10" fill="#f5b544" fillOpacity="0.18" />
      <circle cx="150" cy="96" r="5" fill="#f5b544" />

      {/* raw GPS drifts offshore with a comet trail */}
      <line x1="150" y1="96" x2="150" y2="96" stroke="url(#fm-drift)" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="x2" values={DRIFT_X} keyTimes={KT} dur={D} repeatCount="indefinite" />
        <animate attributeName="y2" values={DRIFT_Y} keyTimes={KT} dur={D} repeatCount="indefinite" />
      </line>
      <g opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={KT} dur={D} repeatCount="indefinite" />
        <circle r="11" fill="#ee8b6f" fillOpacity="0.16">
          <animate attributeName="cx" values={DRIFT_X} keyTimes={KT} dur={D} repeatCount="indefinite" />
          <animate attributeName="cy" values={DRIFT_Y} keyTimes={KT} dur={D} repeatCount="indefinite" />
        </circle>
        <circle r="5" fill="none" stroke="#ee8b6f" strokeWidth="2">
          <animate attributeName="cx" values={DRIFT_X} keyTimes={KT} dur={D} repeatCount="indefinite" />
          <animate attributeName="cy" values={DRIFT_Y} keyTimes={KT} dur={D} repeatCount="indefinite" />
        </circle>
      </g>
      <text x="312" y="54" textAnchor="end" fill="#ee8b6f" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)" opacity="0">
        Raw GPS: 30 km offshore
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes={KT} dur={D} repeatCount="indefinite" />
      </text>

      {/* correction: double sage shockwave + label */}
      {[0, 0.12].map((lag, k) => {
        const kt = "0;0.22;0.34;0.6;" + (0.7 + lag).toFixed(2) + ";1";
        return (
          <circle key={k} cx="150" cy="96" r="5" fill="none" stroke="#86d0a6" strokeWidth={2 - k * 0.8} opacity="0">
            <animate attributeName="r" values={"5;5;5;5;5;" + (22 + k * 10)} keyTimes={kt} dur={D} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0;0;0;1;0" keyTimes={kt} dur={D} repeatCount="indefinite" />
          </circle>
        );
      })}
      <g opacity="0">
        <animate attributeName="opacity" values="0;0;0;0;1;1" keyTimes={KT} dur={D} repeatCount="indefinite" />
        <circle cx="100" cy="128" r="6" fill="#86d0a6" />
        <path d="M97.5 128 l2 2 l3.5 -4" fill="none" stroke="#0a1020" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <text x="110" y="132" fill="#86d0a6" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
          Drift corrected
        </text>
      </g>
    </svg>
  );
}

// Labmentix: records streak into a scanning validation gate. Each row flashes
// as it is checked; bad rows tumble out, clean rows fill the dataset.
export function ValidationGraphic() {
  const ref = useSmilPause();
  const rows = [true, true, false, true, true, false, true];
  const dur = 4.2;
  return (
    <svg ref={ref} viewBox="0 0 320 200" className="block h-full w-full" role="img" aria-label="Data validation: invalid records are filtered out before reaching the dataset">
      <defs>
        <linearGradient id="vg-streak" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="vg-beam" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7cc7e8" stopOpacity="0" />
          <stop offset="0.5" stopColor="#7cc7e8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7cc7e8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="#121c30" />
      <text x="160" y="22" textAnchor="middle" fill="#a9b4c7" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
        Validation
      </text>
      <text x="276" y="22" textAnchor="middle" fill="#86d0a6" fontSize="10" fontWeight="600" fontFamily="var(--font-sans)">
        Dataset
      </text>

      {/* scanning gate: glow + core beam, plus a scan head sweeping up and down */}
      <rect x="153" y="30" width="14" height="140" fill="url(#vg-beam)" opacity="0.18">
        <animate attributeName="opacity" values="0.12;0.26;0.12" dur="1.4s" repeatCount="indefinite" />
      </rect>
      <rect x="159.3" y="30" width="1.4" height="140" fill="url(#vg-beam)" />
      <rect x="150" y="30" width="20" height="3" rx="1.5" fill="#bfe6f6">
        <animate attributeName="y" values="30;167;30" dur="2.4s" repeatCount="indefinite" />
      </rect>

      {/* dataset filling up */}
      <rect x="246" y="34" width="60" height="130" rx="8" fill="#86d0a6" fillOpacity="0.06" stroke="#86d0a6" strokeOpacity="0.35" />
      <rect x="250" y="160" width="52" height="0" rx="5" fill="#86d0a6" fillOpacity="0.22">
        <animate attributeName="y" values="160;46;46" keyTimes="0;0.9;1" dur="9s" repeatCount="indefinite" />
        <animate attributeName="height" values="0;114;114" keyTimes="0;0.9;1" dur="9s" repeatCount="indefinite" />
      </rect>

      {rows.map((ok, i) => {
        const begin = "-" + ((i * dur) / rows.length).toFixed(2) + "s";
        const c = ok ? "#86d0a6" : "#ee8b6f";
        return (
          <g key={i}>
            {/* row + motion streak travel together */}
            <g>
              <animateTransform attributeName="transform" type="translate" values={ok ? "0 0;194 0;300 0" : "0 0;194 0;206 64"} keyTimes="0;0.6;1" dur={dur + "s"} begin={begin} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.82;1" dur={dur + "s"} begin={begin} repeatCount="indefinite" />
              <rect x="-62" y="94" width="28" height="10" fill="url(#vg-streak)" />
              <rect x="-34" y="92" width="34" height="14" rx="4" fill={c} fillOpacity="0.9">
                {!ok && <animateTransform attributeName="transform" type="rotate" values="0 -17 99;0 -17 99;38 -17 99" keyTimes="0;0.6;1" dur={dur + "s"} begin={begin} repeatCount="indefinite" />}
              </rect>
            </g>
            {/* check flash as the row crosses the gate */}
            <circle cx="160" cy="99" r="6" fill={c} opacity="0">
              <animate attributeName="opacity" values="0;0;0.55;0;0" keyTimes="0;0.55;0.6;0.7;1" dur={dur + "s"} begin={begin} repeatCount="indefinite" />
              <animate attributeName="r" values="6;6;9;20;20" keyTimes="0;0.55;0.6;0.7;1" dur={dur + "s"} begin={begin} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
      <text x="160" y="190" textAnchor="middle" fill="#ee8b6f" fontSize="10" fontFamily="var(--font-sans)">
        Invalid rows dropped automatically
      </text>
    </svg>
  );
}
