const values = [
  {
    stat: "Days, Not Months",
    description: "Working solutions delivered rapidly so you see results immediately.",
  },
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
    <section className="py-24 md:py-32 bg-neutral">
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

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item, i) => (
            <div
              key={item.stat}
              className={`animate-in animate-in-delay-${i + 1} text-center bg-white rounded-xl p-10 border border-border`}
            >
              <div className="text-2xl md:text-3xl font-black text-accent mb-3">
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
