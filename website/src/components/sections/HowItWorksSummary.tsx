import Link from "next/link";

const steps = [
  { number: "01", title: "Describe", description: "Tell us about a process that feels broken." },
  { number: "02", title: "Map", description: "We outline the problem and propose a solution." },
  { number: "03", title: "Build", description: "We develop a working tool — often within a week." },
  { number: "04", title: "Deploy", description: "Your solution goes live. We support it from there." },
];

export default function HowItWorksSummary() {
  return (
    <section className="grain relative overflow-hidden bg-mesh-warm text-white py-24 md:py-32">
      <div className="relative z-[2] max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16 animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            The Process
          </p>
          <h2 className="text-white mb-6">From Problem to Solution in Four Steps</h2>
          <p className="text-lg text-white/60">
            No long contracts. No drawn-out timelines. Just a clear path from
            headache to working tool.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className={`animate-in animate-in-delay-${i + 1} relative`}>
              <div
                className="text-5xl font-bold mb-4 text-gradient-warm"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14 animate-in">
          <Link
            href="/how-it-works"
            className="text-accent hover:text-accent-hover font-semibold text-sm transition-colors inline-flex items-center gap-2 group"
          >
            Learn more about our process
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
