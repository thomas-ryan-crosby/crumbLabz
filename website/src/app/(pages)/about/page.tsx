import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — CrumbLabz",
  description: "Learn about the philosophy and mission behind CrumbLabz.",
};

const beliefs = [
  {
    title: "Problems Should Be Solved Quickly",
    description:
      "Businesses should not have to wait months to improve their operations. Modern development tools make it possible to build working solutions rapidly.",
  },
  {
    title: "Small Tools Can Create Big Impact",
    description:
      "Many operational challenges can be solved with simple tools. A focused solution that saves a team several hours each week can create enormous long-term value.",
  },
  {
    title: "Technology Should Be Approachable",
    description:
      "Clients should not need to understand the underlying technology. They only need to understand that the solution works and improves their business.",
  },
  {
    title: "Build First, Refine Later",
    description:
      "Instead of long planning cycles, we prioritize rapid prototypes and working tools. Once a solution is in place, it can evolve and improve over time.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-charcoal text-white py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-white mb-6">About CrumbLabz</h1>
          <p className="text-lg text-white/70">
            A solutions-focused development studio that helps businesses solve
            operational problems by rapidly building custom software tools.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="mb-6">Our Mission</h2>
          <p className="text-lg text-muted mb-6">
            CrumbLabz helps businesses operate more efficiently by rapidly
            designing and deploying software tools that solve real operational
            problems.
          </p>
          <p className="text-lg text-muted">
            Rather than large, slow technology projects, we focus on small,
            targeted solutions that deliver immediate value. Each engagement
            begins with a problem and ends with a working solution.
          </p>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="bg-neutral py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center mb-16">What We Believe</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {beliefs.map((belief) => (
              <div
                key={belief.title}
                className="bg-white rounded-xl p-8 border border-border"
              >
                <h3 className="text-xl font-bold mb-3">{belief.title}</h3>
                <p className="text-muted">{belief.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="mb-6">Our Vision</h2>
          <p className="text-lg text-muted mb-6">
            CrumbLabz aims to become the most trusted partner for businesses
            looking to modernize their operations through practical software
            solutions.
          </p>
          <p className="text-lg text-muted mb-10">
            Technology should not be a barrier to efficiency. It should be a
            tool that is accessible, adaptable, and fast to implement.
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
