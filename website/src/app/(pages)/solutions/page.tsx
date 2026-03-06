import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Solutions — CrumbLabz",
  description: "Explore the types of operational problems CrumbLabz solves for businesses.",
};

const solutions = [
  {
    title: "Workflow Automation",
    description:
      "Automating repetitive tasks that consume valuable time. From data entry to approval chains, we build tools that handle the busywork so your team can focus on what matters.",
  },
  {
    title: "Business Intelligence Tools",
    description:
      "Creating dashboards and tools that surface insights from your operational data. Stop digging through spreadsheets and start making decisions with clarity.",
  },
  {
    title: "Reporting Automation",
    description:
      "Generating reports automatically rather than compiling them manually. Weekly summaries, client updates, and internal metrics — delivered without the effort.",
  },
  {
    title: "Customer Communication Tools",
    description:
      "Responding to inquiries and requests more efficiently. We build tools that streamline how your team communicates with customers, reducing response times.",
  },
  {
    title: "System Integration",
    description:
      "Connecting software tools that currently do not communicate with each other. Eliminate double-entry and manual transfers between your existing systems.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-charcoal text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-white mb-6">Solutions</h1>
          <p className="text-lg text-white/70">
            We solve the operational problems that slow your business down.
            Here are the types of challenges we tackle most often.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution) => (
              <div
                key={solution.title}
                className="bg-neutral rounded-xl p-8 border border-border"
              >
                <h3 className="text-xl font-bold mb-3">{solution.title}</h3>
                <p className="text-muted">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="mb-6">Don&apos;t See Your Problem Listed?</h2>
          <p className="text-lg text-muted mb-10">
            Every business is different. Tell us what&apos;s slowing you down and
            we&apos;ll figure out the best way to solve it.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Start the Conversation
          </Link>
        </div>
      </section>
    </>
  );
}
