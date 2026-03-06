import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How It Works — CrumbLabz",
  description: "Learn how CrumbLabz turns operational problems into working tools in four simple steps.",
};

const steps = [
  {
    number: "01",
    title: "Identify the Problem",
    description:
      "You describe an operational challenge or inefficiency within your business. The goal is to isolate one process that can be improved.",
  },
  {
    number: "02",
    title: "Map the Solution",
    description:
      "CrumbLabz prepares a short document describing the problem, the current workflow, the proposed solution, and the expected improvements.",
  },
  {
    number: "03",
    title: "Build the Tool",
    description:
      "CrumbLabz builds a working solution, often within a week. The focus is on practicality and rapid deployment rather than long development cycles.",
  },
  {
    number: "04",
    title: "Deploy and Improve",
    description:
      "You can either take ownership of the tool or have CrumbLabz maintain and improve it over time as your needs evolve.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-charcoal text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-white mb-6">How It Works</h1>
          <p className="text-lg text-white/70">
            A simple, four-step process from problem to working solution.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-16">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6 md:gap-10">
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-lg font-bold">
                    {step.number}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    {step.title}
                  </h2>
                  <p className="text-muted text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
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
    </>
  );
}
