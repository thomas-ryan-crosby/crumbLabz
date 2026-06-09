const cards = [
  {
    stat: "Built for You",
    description: "Every tool is designed around your specific workflow and needs.",
  },
  {
    stat: "Real Results",
    description: "Measurable improvements in efficiency, speed, and clarity.",
  },
];

export default function ValueSection() {
  return (
    <section className="py-24 md:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16 animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            The Difference
          </p>
          <h2 className="mb-6">Why CrumbLabz?</h2>
          <p className="text-lg text-muted">
            We&apos;re not a consulting firm that bills by the hour.
            We&apos;re builders who deliver tools that work.
          </p>
        </div>

        {/* Bento: one large dark feature tile, two supporting cards */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="animate-in grain relative overflow-hidden lg:col-span-2 bg-mesh-warm rounded-3xl p-10 md:p-14 text-white">
            <div className="relative z-[2] max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-accent mb-4">
                Speed is the difference
              </p>
              <p
                className="text-4xl md:text-6xl font-bold text-gradient-warm mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Days, not months
              </p>
              <p className="text-white/60 text-lg leading-relaxed">
                Working solutions delivered rapidly so you see results
                immediately — not after a quarter-long engagement.
              </p>
            </div>
          </div>

          {cards.map((item, i) => (
            <div
              key={item.stat}
              className={`animate-in animate-in-delay-${i + 1} bg-white rounded-3xl p-10 border border-border/70 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300`}
            >
              <div
                className="text-2xl md:text-3xl font-bold text-charcoal mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {item.stat}
              </div>
              <p className="text-muted leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
