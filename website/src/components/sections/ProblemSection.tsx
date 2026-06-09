const problems = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    title: "Manual Data Entry",
    description: "Tools that capture and move data automatically — no more retyping.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: "Slow Reporting",
    description: "Automated report generation so insights are ready when you need them.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.54a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757" />
      </svg>
    ),
    title: "Disconnected Tools",
    description: "Connected systems so data flows without manual transfers.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
    title: "Slow Customer Response",
    description: "Streamlined communication workflows so your team responds faster.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
      </svg>
    ),
    title: "Repetitive Admin Tasks",
    description: "Automation for the daily busywork so your team focuses on what matters.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "No Visibility Into Data",
    description: "Dashboards that surface the insights buried in your spreadsheets.",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative bg-cream py-24 md:py-32 overflow-hidden">
      {/* Soft decorative glow for depth */}
      <div className="pointer-events-none absolute -top-32 -right-24 w-[42rem] h-[42rem] rounded-full bg-accent/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Editorial intro — one statement instead of two stacked headers */}
        <div className="max-w-3xl mb-16 animate-in">
          <p className="inline-flex items-center gap-2.5 text-accent font-semibold text-sm uppercase tracking-widest mb-5">
            <span className="w-6 h-px bg-accent" />
            The Problem
          </p>
          <h2 className="mb-5 text-balance">
            Every business has processes that quietly{" "}
            <span className="text-gradient-warm">drain time and energy.</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl">
            Sound familiar? These are the everyday headaches we turn into working
            tools — quickly, and without the overhead of a traditional software
            project.
          </p>
        </div>

        {/* Headache → fix grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((problem, i) => (
            <div
              key={problem.title}
              className={`animate-in animate-in-delay-${(i % 3) + 1} group relative overflow-hidden bg-white rounded-2xl border border-border/70 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Accent bar grows in on hover */}
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300" />

              <div className="p-7">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-accent-light text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                    {problem.icon}
                  </div>
                  <span
                    className="text-2xl font-bold text-charcoal/10 tabular-nums leading-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* The pain */}
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted/60 mb-1">
                  The headache
                </p>
                <h3 className="text-lg font-bold text-charcoal mb-4 group-hover:text-accent transition-colors duration-300">
                  {problem.title}
                </h3>

                {/* The fix */}
                <div className="flex gap-2.5 pt-4 border-t border-border/70">
                  <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <p className="text-sm text-muted leading-relaxed">{problem.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
