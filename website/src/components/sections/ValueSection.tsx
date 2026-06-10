const TRADITIONAL = [
  "Months of development before anything ships",
  "Billed by the hour, costs creep up",
  "Locked into a big, rigid contract",
  "Generic, bloated software",
  "You wait, then hope it fits",
];

const CRUMBLABZ = [
  "A working tool in days, not months",
  "Clear, project-based scope",
  "Built around your exact workflow",
  "Only what you actually need",
  "Results you see immediately",
];

export default function ValueSection() {
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14 animate-in">
          <p className="inline-flex items-center justify-center gap-2.5 text-accent font-semibold text-sm uppercase tracking-widest mb-4">
            <span className="w-5 h-px bg-accent" />
            The Difference
            <span className="w-5 h-px bg-accent" />
          </p>
          <h2 className="mb-5">Why CrumbLabz?</h2>
          <p className="text-lg text-muted">
            We&apos;re not a consulting firm that bills by the hour. We&apos;re
            builders who deliver tools that work — here&apos;s the difference.
          </p>
        </div>

        <div className="relative grid md:grid-cols-2 gap-5 items-stretch">
          {/* The traditional way */}
          <div className="animate-in bg-white rounded-3xl border border-border/70 shadow-soft p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted/60 mb-6">
              The traditional way
            </p>
            <ul className="space-y-4">
              {TRADITIONAL.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted">
                  <svg className="w-5 h-5 shrink-0 mt-0.5 text-border" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The CrumbLabz way */}
          <div className="animate-in animate-in-delay-1 grain relative overflow-hidden bg-mesh-warm rounded-3xl shadow-lift p-8 md:p-10 text-white">
            <div className="relative z-[2]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-accent mb-6">
                The CrumbLabz way
              </p>
              <ul className="space-y-4">
                {CRUMBLABZ.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-white/90">
                    <svg className="w-5 h-5 shrink-0 mt-0.5 text-[#f7b733]" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* vs badge */}
          <div
            className="hidden md:grid absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 place-items-center w-14 h-14 rounded-full bg-accent text-white font-bold shadow-lift ring-4 ring-cream z-10"
            style={{ fontFamily: "var(--font-display)" }}
          >
            vs
          </div>
        </div>
      </div>
    </section>
  );
}
