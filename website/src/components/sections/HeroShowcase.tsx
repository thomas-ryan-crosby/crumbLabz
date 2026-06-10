"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Process steps appear one at a time at the TOP of the ring, fan out, circle,
// then spiral in and bake into the CrumbLabz logo, which becomes the dashboard.
const STEPS = [
  { label: "Discovery", a: 0 },
  { label: "Ideation", a: 72 },
  { label: "Prototype", a: 144 },
  { label: "Build", a: 216 },
  { label: "Launch", a: 288 },
];

type Phase = "scatter" | "orbit" | "gather" | "form" | "logohold" | "reveal" | "hold";

// [phase, revealedCount, ringAngle(deg), duration(ms)]
// ringAngle is set so each newly revealed pill (armAngle + ringAngle ≡ 270°)
// lands at the top; revealing one per frame, slowly, makes them readable.
const FRAMES: [Phase, number, number, number][] = [
  ["scatter", 0, 270, 500],
  ["orbit", 1, 270, 1700],
  ["orbit", 2, 198, 1700],
  ["orbit", 3, 126, 1700],
  ["orbit", 4, 54, 1700],
  ["orbit", 5, -18, 1900],
  ["orbit", 5, -120, 2600],
  ["gather", 5, -120, 2300],
  ["form", 5, -120, 1100],
  ["logohold", 5, -120, 1800],
  ["reveal", 5, -120, 1100],
  ["hold", 5, -120, 5500],
];

const ORBIT_RADIUS = 184;
const BARS = [42, 55, 48, 67, 60, 78, 72, 96];
const RING_TRANSITION = "transform 1.4s cubic-bezier(0.45, 0, 0.2, 1)";

export default function HeroShowcase() {
  const [phase, setPhase] = useState<Phase>("scatter");
  const [revealed, setRevealed] = useState(0);
  const [ringAngle, setRingAngle] = useState(270);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hold");
      setRevealed(5);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    const run = () => {
      const [p, r, ang, d] = FRAMES[i];
      setPhase(p);
      setRevealed(r);
      setRingAngle(ang);
      i = (i + 1) % FRAMES.length;
      timer = setTimeout(run, d);
    };
    run();
    return () => clearTimeout(timer);
  }, []);

  const chipsActive = phase === "scatter" || phase === "orbit" || phase === "gather";
  const radius = phase === "scatter" || phase === "orbit" ? ORBIT_RADIUS : 0;
  const logoVisible = phase === "form" || phase === "logohold";
  // Pop in (form) → slow continuous grow (logohold) → fast explode out (reveal).
  const logoScale =
    phase === "form" ? 1 : phase === "logohold" ? 1.14 : phase === "reveal" || phase === "hold" ? 1.7 : 0.55;
  const logoTransition =
    phase === "logohold"
      ? "transform 1.9s cubic-bezier(0.33, 0, 0.4, 1), opacity 0.5s ease"
      : phase === "reveal" || phase === "hold"
        ? "transform 0.5s cubic-bezier(0.5, 0, 0.85, 0.3), opacity 0.45s ease"
        : "transform 0.75s cubic-bezier(0.2, 1.25, 0.4, 1), opacity 0.55s ease";
  const delivered = phase === "reveal" || phase === "hold";

  return (
    <div className="relative" style={{ perspective: "1500px" }}>
      <div className="relative" style={{ transform: "rotateY(-12deg) rotateX(6deg)" }}>
        <div className="relative" style={{ width: 470, height: 440 }}>
          {/* Glow */}
          <div className="absolute inset-6 rounded-[2.5rem] bg-accent/20 blur-3xl" />

          {/* Orbiting process steps (ring rotation driven in JS) */}
          <div
            className="absolute left-1/2 top-1/2"
            style={{ width: 0, height: 0, transform: `rotate(${ringAngle}deg)`, transition: RING_TRANSITION }}
          >
            {STEPS.map((s, i) => (
              <div
                key={s.label}
                className="absolute left-0 top-0"
                style={{
                  transform: `rotate(${s.a}deg) translateX(${radius}px)`,
                  transition: "transform 2.2s cubic-bezier(0.5, 0, 0.15, 1)",
                }}
              >
                {/* Counter the arm's static angle */}
                <div style={{ transform: `rotate(${-s.a}deg)` }}>
                  {/* Counter the ring rotation → label always upright */}
                  <span
                    className="absolute inline-flex items-center justify-center gap-2 min-w-[132px] whitespace-nowrap rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-charcoal shadow-lift ring-1 ring-black/5"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${-ringAngle}deg)`,
                      opacity: chipsActive && i < revealed ? 1 : 0,
                      transition: `${RING_TRANSITION}, opacity 0.6s ease`,
                    }}
                  >
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Logo lockup — crumbs bake into the official cookie + wordmark */}
          <div className="absolute inset-0 grid place-items-center" style={{ zIndex: 3 }}>
            <div
              style={{
                opacity: logoVisible ? 1 : 0,
                transform: `scale(${logoScale})`,
                transition: logoTransition,
              }}
            >
              <Image
                src="/images/CrumbLabz_LogoFull.png"
                alt="CrumbLabz"
                width={320}
                height={75}
                className="brightness-0 invert drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Delivered dashboard */}
          <div className="absolute inset-0 grid place-items-center" style={{ zIndex: 2 }}>
            <div
              style={{
                opacity: delivered ? 1 : 0,
                transform: `scale(${delivered ? 1 : 0.55})`,
                transition:
                  "transform 0.7s cubic-bezier(0.2, 1.2, 0.4, 1), opacity 0.5s ease",
              }}
            >
              <div
                className={`relative w-[382px] max-w-full rounded-2xl bg-white text-charcoal shadow-2xl ring-1 ring-black/10 overflow-hidden${delivered ? " dash-breathe" : ""}`}
              >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-neutral">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e0726b]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#e6b450]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#5aa86a]" />
                <span className="ml-3 text-[11px] text-muted">app.crumblabz.com</span>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Live</p>
                      <p className="text-[15px] font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>
                        Operations Dashboard
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 bg-emerald-500/10 text-emerald-700">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    Delivered
                  </span>
                </div>

                {/* Metric tiles */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { v: "248", l: "Orders" },
                    { v: "14h", l: "Saved / wk", accent: true },
                    { v: "98%", l: "On time" },
                  ].map((m, i) => (
                    <div key={i} className="rounded-xl border border-border p-3">
                      <p className={`text-lg font-bold tabular-nums ${m.accent ? "text-accent" : ""}`}>{m.v}</p>
                      <p className="text-[9px] uppercase tracking-wide text-muted">{m.l}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-semibold text-charcoal">Throughput</p>
                    <p className="text-[9px] text-muted">Last 8 weeks</p>
                  </div>
                  <div className="flex items-end gap-2 h-20">
                    {BARS.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t"
                        style={{
                          height: delivered ? `${h}%` : "12%",
                          background:
                            i === BARS.length - 1 ? "var(--color-accent)" : "rgba(232,122,46,0.28)",
                          transition: "height 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                          transitionDelay: `${i * 55}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
