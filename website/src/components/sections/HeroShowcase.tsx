"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Process steps orbit the center, spiral in, and bake into the CrumbLabz logo
// lockup (cookie + wordmark), which then becomes the delivered dashboard.
const STEPS = [
  { label: "Discovery", a: 0 },
  { label: "Ideation", a: 72 },
  { label: "Prototype", a: 144 },
  { label: "Build", a: 216 },
  { label: "Launch", a: 288 },
];

const SEQUENCE: [Phase, number][] = [
  ["scatter", 150],
  ["orbit", 1100],
  ["gather", 1200],
  ["form", 700],
  ["spin", 850],
  ["reveal", 850],
  ["hold", 2400],
];

type Phase = "scatter" | "orbit" | "gather" | "form" | "spin" | "reveal" | "hold";

const ORBIT_RADIUS = 168;
const BARS = [42, 55, 48, 67, 60, 78, 72, 96];

export default function HeroShowcase() {
  const [phase, setPhase] = useState<Phase>("scatter");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("hold"); // show the delivered dashboard, no looping
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    const run = () => {
      setPhase(SEQUENCE[i][0]);
      const d = SEQUENCE[i][1];
      i = (i + 1) % SEQUENCE.length;
      timer = setTimeout(run, d);
    };
    run();
    return () => clearTimeout(timer);
  }, []);

  const chipsVisible = phase === "orbit" || phase === "gather";
  const radius = phase === "scatter" || phase === "orbit" ? ORBIT_RADIUS : 0;
  const logoVisible = phase === "form" || phase === "spin";
  const logoScale =
    phase === "form" ? 1 : phase === "spin" ? 1.06 : phase === "reveal" || phase === "hold" ? 1.15 : 0.5;
  const delivered = phase === "reveal" || phase === "hold";

  return (
    <div className="relative" style={{ perspective: "1500px" }}>
      <div className="relative" style={{ transform: "rotateY(-12deg) rotateX(6deg)" }}>
        <div className="relative" style={{ width: 470, height: 440 }}>
          {/* Glow */}
          <div className="absolute inset-6 rounded-[2.5rem] bg-accent/20 blur-3xl" />

          {/* Orbiting process steps */}
          <div className="orbit-spin absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
            {STEPS.map((s) => (
              <div
                key={s.label}
                className="absolute left-0 top-0"
                style={{
                  transform: `rotate(${s.a}deg) translateX(${radius}px)`,
                  transition: "transform 1.2s cubic-bezier(0.5, 0, 0.15, 1)",
                }}
              >
                {/* Counter the arm's static angle */}
                <div style={{ transform: `rotate(${-s.a}deg)` }}>
                  {/* Counter the group's live spin → label stays upright */}
                  <span
                    className="orbit-spin-rev absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-charcoal shadow-lift ring-1 ring-black/5 backdrop-blur"
                    style={{ opacity: chipsVisible ? 1 : 0, transition: "opacity 0.5s ease" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {s.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Logo lockup — crumbs bake into the official cookie + wordmark */}
          <div className="absolute inset-0 grid place-items-center" style={{ zIndex: 3 }}>
            <div
              className="flex items-center gap-3"
              style={{
                opacity: logoVisible ? 1 : 0,
                transform: `scale(${logoScale})`,
                transition:
                  "transform 0.7s cubic-bezier(0.2, 1.25, 0.4, 1), opacity 0.5s ease",
              }}
            >
              <Image
                src="/images/CrumbLabz_Cookie.png"
                alt=""
                width={60}
                height={60}
                className="drop-shadow-xl"
                style={{
                  transform: phase === "spin" ? "rotate(360deg)" : "rotate(0deg)",
                  transition: "transform 0.85s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
              <Image
                src="/images/CrumbLabz_Wordmark.png"
                alt="CrumbLabz"
                width={150}
                height={34}
                className="brightness-0 invert"
              />
            </div>
          </div>

          {/* Delivered dashboard */}
          <div className="absolute inset-0 grid place-items-center" style={{ zIndex: 2 }}>
            <div
              className="relative w-[382px] max-w-full rounded-2xl bg-white text-charcoal shadow-2xl ring-1 ring-black/10 overflow-hidden"
              style={{
                opacity: delivered ? 1 : 0,
                transform: `scale(${delivered ? 1 : 0.72})`,
                transition:
                  "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease",
              }}
            >
              {/* Cookie badge — brand continuity from the logo */}
              <div
                className="absolute -top-5 -right-3 z-10"
                style={{
                  opacity: phase === "hold" ? 1 : 0,
                  transform: phase === "hold" ? "scale(1) rotate(-8deg)" : "scale(0.3) rotate(30deg)",
                  transition: "transform 0.6s cubic-bezier(0.2, 1.25, 0.4, 1), opacity 0.5s ease",
                }}
              >
                <Image src="/images/CrumbLabz_Cookie.png" alt="" width={56} height={56} className="drop-shadow-lg" />
              </div>

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
  );
}
