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
    <section className="bg-neutral py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Problem statement */}
        <div className="max-w-3xl mx-auto text-center mb-20 animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            The Problem
          </p>
          <h2 className="mb-6">
            Every business has processes that drain time and energy.
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            These are the headaches we eliminate.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-20 animate-in">
          <div className="h-px w-16 bg-border" />
          <div className="w-2 h-2 rounded-full bg-accent" />
          <div className="h-px w-16 bg-border" />
        </div>

        {/* Sound Familiar + Cards */}
        <div className="animate-in">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="mb-6">Sound Familiar?</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              CrumbLabz identifies these inefficiencies and builds targeted tools
              that eliminate them — quickly and without the overhead of a traditional
              software project.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((problem, i) => (
              <div
                key={problem.title}
                className={`animate-in animate-in-delay-${i + 1} group relative bg-white rounded-xl p-7 border border-border hover:border-accent/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-accent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="w-11 h-11 rounded-lg bg-accent-light text-accent flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                  {problem.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
