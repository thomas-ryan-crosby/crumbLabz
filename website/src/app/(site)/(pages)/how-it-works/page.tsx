import type { Metadata } from "next";
import Link from "next/link";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import PageHero from "@/components/sections/PageHero";
import Magnetic from "@/components/motion/Magnetic";

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
      <PageHero
        eyebrow="The Process"
        title={<>How It <span className="text-gradient-warm">Works</span></>}
        subtitle="A simple, four-step process from problem to working solution. No jargon. No surprises."
      />

      {/* Steps timeline */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative">
            {/* Vertical connector */}
            <div className="hidden md:block absolute left-8 top-6 bottom-6 w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" />

            <div className="space-y-10 md:space-y-14">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`animate-in animate-in-delay-${i + 1} relative flex gap-6 md:gap-10`}
                >
                  <div className="shrink-0 relative z-[1]">
                    <div
                      className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-lg font-bold shadow-lift"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-border/70 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 p-7 md:p-8">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">{step.title}</h2>
                    <p className="text-accent font-semibold text-sm mb-4">{step.highlight}</p>
                    <p className="text-muted text-lg leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream py-24">
        <div className="max-w-3xl mx-auto px-6 text-center animate-in">
          <h2 className="mb-6">Ready to Solve a Problem?</h2>
          <p className="text-lg text-muted mb-10">
            It starts with describing one operational headache. We handle the rest.
          </p>
          <Magnetic>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lift transition-all duration-300 hover:-translate-y-0.5"
            >
              Tell Us Your Headache
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </Magnetic>
        </div>
      </section>
    </ScrollRevealProvider>
  );
}
