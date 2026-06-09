import Link from "next/link";
import Magnetic from "@/components/motion/Magnetic";

export default function Hero() {
  return (
    <section className="grain relative bg-mesh-warm text-white min-h-[92vh] flex items-center overflow-hidden">
      {/* Soft vignette to seat the content */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal-dark/40 via-transparent to-charcoal-dark/40" />

      <div className="relative z-[2] w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        {/* Text */}
        <div>
          <p className="hero-fade-in inline-flex items-center gap-2 mb-6 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm font-medium text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Custom Tools for Smarter Operations
          </p>

          <h1 className="hero-fade-in hero-fade-in-delay-1 text-white text-balance mb-6">
            We build the tools that{" "}
            <span className="text-gradient-warm">improve your business</span>
          </h1>

          <p className="hero-fade-in hero-fade-in-delay-2 max-w-xl mb-10 text-lg md:text-xl text-white/55 leading-relaxed">
            You describe the problem. We design and build a working solution —
            often in days, not months.
          </p>

          <div className="hero-fade-in hero-fade-in-delay-3 flex flex-wrap gap-4">
            <Magnetic>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-7 py-4 rounded-xl text-base shadow-lift transition-all duration-300 hover:-translate-y-0.5"
              >
                Tell Us Your Headache
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                href="/how-it-works"
                className="inline-flex items-center border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold px-7 py-4 rounded-xl text-base backdrop-blur transition-all duration-300"
              >
                See How It Works
              </Link>
            </Magnetic>
          </div>

          {/* Trust line */}
          <div className="hero-fade-in hero-fade-in-delay-3 mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45">
            <span>Days, not months</span>
            <span className="w-px h-4 bg-white/15" />
            <span>Built around your workflow</span>
            <span className="w-px h-4 bg-white/15" />
            <span>Real, working software</span>
          </div>
        </div>

        {/* Product showcase — floating, tilted "app we built" */}
        <div className="hero-fade-in hero-fade-in-delay-2 hidden lg:block">
          <div className="relative" style={{ perspective: "1500px" }}>
            <div
              className="relative"
              style={{ transform: "rotateY(-13deg) rotateX(7deg)" }}
            >
              {/* Glow */}
              <div className="absolute -inset-10 rounded-[2.5rem] bg-accent/20 blur-3xl" />

              {/* Floating app card */}
              <div className="animate-float-y relative w-[470px] max-w-full rounded-2xl bg-white text-charcoal shadow-2xl ring-1 ring-black/10 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-neutral">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e0726b]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e6b450]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5aa86a]" />
                  <span className="ml-3 text-[11px] text-muted">app.crumblabz.com</span>
                </div>

                {/* App body */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-accent">Live</p>
                      <p className="text-[15px] font-bold text-charcoal" style={{ fontFamily: "var(--font-display)" }}>
                        Operations Dashboard
                      </p>
                    </div>
                    <span className="text-[10px] text-muted border border-border rounded-full px-2.5 py-1">This Month</span>
                  </div>

                  {/* Metric tiles */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-lg font-bold tabular-nums">248</p>
                      <p className="text-[9px] uppercase tracking-wide text-muted">Orders</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-lg font-bold tabular-nums text-accent">14h</p>
                      <p className="text-[9px] uppercase tracking-wide text-muted">Saved / wk</p>
                    </div>
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-lg font-bold tabular-nums">98%</p>
                      <p className="text-[9px] uppercase tracking-wide text-muted">On time</p>
                    </div>
                  </div>

                  {/* Mini bar chart */}
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-semibold text-charcoal">Throughput</p>
                      <p className="text-[9px] text-muted">Last 8 weeks</p>
                    </div>
                    <div className="flex items-end gap-2 h-20">
                      {[42, 55, 48, 67, 60, 78, 72, 90].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${h}%`,
                            background: i === 7 ? "var(--color-accent)" : "rgba(232,122,46,0.28)",
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
    </section>
  );
}
