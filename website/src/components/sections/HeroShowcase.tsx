"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// The 4-beat story: ideas (crumbs) gather → form the cookie → delivered software.
const STEPS = ["Discuss", "Ideate", "Prototype", "Deliver"];
const STEP_MS = [1700, 1700, 1700, 4000];
const CRUMBS = ["Discussion", "Ideation", "Prototype"];
const BARS = [42, 55, 48, 67, 60, 78, 72, 96];

// Resting positions for each crumb chip (above the card), and where they fly
// to on delivery (up toward the cookie stamp at the top-right).
const CRUMB_REST = [
  { x: 30, y: -56 },
  { x: 178, y: -68 },
  { x: 322, y: -54 },
];

function crumbStyle(i: number, step: number, delivered: boolean): React.CSSProperties {
  const rest = CRUMB_REST[i];
  const base: React.CSSProperties = {
    transition:
      "transform 0.8s var(--ease-out-expo), opacity 0.55s ease",
  };
  if (delivered) {
    return { ...base, transform: `translate(405px, -8px) scale(0.4)`, opacity: 0 };
  }
  if (step >= i) {
    return { ...base, transform: `translate(${rest.x}px, ${rest.y}px) scale(1)`, opacity: 1 };
  }
  return { ...base, transform: `translate(${rest.x}px, ${rest.y - 14}px) scale(0.85)`, opacity: 0 };
}

export default function HeroShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(3); // show the delivered state, no looping
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    let current = 0;
    const advance = () => {
      timer = setTimeout(() => {
        current = (current + 1) % 4;
        setStep(current);
        advance();
      }, STEP_MS[current]);
    };
    advance();
    return () => clearTimeout(timer);
  }, []);

  const delivered = step === 3;
  const tiles = [
    { v: "248", l: "Orders" },
    { v: "14h", l: "Saved / wk", accent: true },
    { v: "98%", l: "On time" },
  ];

  return (
    <div className="relative" style={{ perspective: "1500px" }}>
      <div className="relative" style={{ transform: "rotateY(-13deg) rotateX(7deg)" }}>
        {/* Glow */}
        <div className="absolute -inset-10 rounded-[2.5rem] bg-accent/20 blur-3xl" />

        {/* Crumb chips — the inputs that gather into the cookie */}
        {CRUMBS.map((label, i) => (
          <div
            key={label}
            className="absolute left-0 top-0 z-20"
            style={crumbStyle(i, step, delivered)}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-charcoal shadow-lift ring-1 ring-black/5 backdrop-blur whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {label}
            </span>
          </div>
        ))}

        {/* Cookie stamp — crumbs become the cookie on delivery */}
        <div
          className="absolute -top-6 -right-2 z-30"
          style={{
            opacity: delivered ? 1 : 0,
            transform: delivered ? "scale(1) rotate(-8deg)" : "scale(0.3) rotate(35deg)",
            transition: "transform 0.6s var(--ease-out-expo), opacity 0.5s ease",
          }}
        >
          <Image
            src="/images/CrumbLabz_Cookie.png"
            alt=""
            width={76}
            height={76}
            className="drop-shadow-xl"
          />
        </div>

        {/* Floating app card — the delivered software, assembling as steps advance */}
        <div className="animate-float-y relative w-[470px] max-w-full rounded-2xl bg-white text-charcoal shadow-2xl ring-1 ring-black/10 overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-neutral">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e0726b]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e6b450]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#5aa86a]" />
            <span className="ml-3 text-[11px] text-muted">app.crumblabz.com</span>
          </div>

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                    delivered ? "bg-emerald-500 animate-pulse" : "bg-accent/40"
                  }`}
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                    {delivered ? "Live" : "Building"}
                  </p>
                  <p
                    className="text-[15px] font-bold text-charcoal"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Operations Dashboard
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-2.5 py-1 transition-colors duration-500 ${
                  delivered
                    ? "bg-emerald-500/10 text-emerald-700"
                    : "text-muted border border-border"
                }`}
              >
                {delivered && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
                {delivered ? "Delivered" : "This Month"}
              </span>
            </div>

            {/* Process stepper */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                {STEPS.map((label, i) => (
                  <span
                    key={label}
                    className={`text-[9px] font-bold uppercase tracking-wide transition-colors duration-300 ${
                      i <= step ? "text-accent" : "text-muted/40"
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="relative h-1 rounded-full bg-neutral">
                <div
                  className="absolute left-0 top-0 h-1 rounded-full bg-accent transition-all duration-700 ease-out"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-colors duration-300 ${
                      i <= step ? "bg-accent border-accent" : "bg-white border-border"
                    }`}
                    style={{ left: `calc(${(i / 3) * 100}% - 5px)` }}
                  />
                ))}
              </div>
            </div>

            {/* Metric tiles — skeleton until "Ideate" */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {tiles.map((m, i) => (
                <div key={i} className="relative rounded-xl border border-border p-3 h-[52px]">
                  <div
                    className="absolute inset-3 flex flex-col gap-1.5 transition-opacity duration-500"
                    style={{ opacity: step >= 1 ? 0 : 1 }}
                  >
                    <div className="h-4 w-8 rounded bg-neutral" />
                    <div className="h-2 w-10 rounded bg-neutral" />
                  </div>
                  <div
                    className="transition-opacity duration-500"
                    style={{ opacity: step >= 1 ? 1 : 0, transitionDelay: `${i * 110}ms` }}
                  >
                    <p className={`text-lg font-bold tabular-nums ${m.accent ? "text-accent" : ""}`}>
                      {m.v}
                    </p>
                    <p className="text-[9px] uppercase tracking-wide text-muted">{m.l}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart — bars rise at "Prototype", last bar pops on "Deliver" */}
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
                      height: step >= 2 ? `${h}%` : "12%",
                      background:
                        i === BARS.length - 1 && delivered
                          ? "var(--color-accent)"
                          : "rgba(232,122,46,0.28)",
                      transition: "height 0.7s var(--ease-out-expo), background-color 0.4s ease",
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
  );
}
