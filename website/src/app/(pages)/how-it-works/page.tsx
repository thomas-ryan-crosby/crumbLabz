import type { Metadata } from "next";
import Link from "next/link";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export const metadata: Metadata = {
  title: "How It Works — CrumbLabz",
  description: "Learn how CrumbLabz turns operational problems into working tools in four simple steps.",
};

const steps = [
  {
    number: "01",
    title: "Identify the Problem",
    description:
      "You describe an operational challenge or inefficiency within your business. The goal is to isolate one process that can be improved. No technical knowledge required — just tell us what frustrates you.",
    highlight: "You talk, we listen.",
  },
  {
    number: "02",
    title: "Map the Solution",
    description:
      "CrumbLabz prepares a clear document outlining the problem, the current workflow, the proposed solution, and the expected improvements. You review it and we align before a single line of code is written.",
    highlight: "Full clarity before we build.",
  },
  {
    number: "03",
    title: "Build the Tool",
    description:
      "We build a working solution — often within a week. The focus is on practicality and rapid deployment rather than long development cycles. You see progress fast.",
    highlight: "Days, not months.",
  },
  {
    number: "04",
    title: "Deploy and Improve",
    description:
      "Your tool goes live. You can either take full ownership or have CrumbLabz maintain and improve it over time as your needs evolve.",
    highlight: "Launch is just the beginning.",
  },
];

export default function HowItWorksPage() {
  return (
    <ScrollRevealProvider>
      {/* Hero */}
      <section className="bg-charcoal text-white pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="hero-fade-in text-accent font-semibold text-sm uppercase tracking-widest mb-4">
            The Process
          </p>
          <h1 className="hero-fade-in hero-fade-in-delay-1 text-white mb-6">How It Works</h1>
          <p className="hero-fade-in hero-fade-in-delay-2 text-lg text-white/60 max-w-xl mx-auto">
            A simple, four-step process from problem to working solution.
            No jargon. No surprises.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-20">
            {steps.map((step, i) => (
              <div key={step.number} className={`animate-in animate-in-delay-${i + 1} flex gap-8 md:gap-12`}>
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-accent/20">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {step.title}
                  </h2>
                  <p className="text-accent font-semibold text-sm mb-4">
                    {step.highlight}
                  </p>
                  <p className="text-muted text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral py-24">
        <div className="max-w-3xl mx-auto px-6 text-center animate-in">
          <h2 className="mb-6">Ready to Solve a Problem?</h2>
          <p className="text-lg text-muted mb-10">
            It starts with describing one operational headache. We handle the rest.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Tell Us Your Headache
          </Link>
        </div>
      </section>
    </ScrollRevealProvider>
  );
}
