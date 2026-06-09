import type { Metadata } from "next";
import Link from "next/link";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import PageHero from "@/components/sections/PageHero";
import Magnetic from "@/components/motion/Magnetic";

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
      "Many operational challenges can be solved with simple tools. A focused solution that saves a team several hours each week creates enormous long-term value.",
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
    <ScrollRevealProvider>
      <PageHero
        eyebrow="Who We Are"
        title={<>About <span className="text-gradient-warm">CrumbLabz</span></>}
        subtitle="A solutions-focused development studio that helps businesses solve operational problems by rapidly building custom software tools."
      />

      {/* Mission */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2 animate-in">
              <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
                Our Mission
              </p>
              <h2>Why We Exist</h2>
            </div>
            <div className="md:col-span-3 animate-in animate-in-delay-1">
              <p className="text-lg text-muted leading-relaxed mb-6">
                CrumbLabz helps businesses operate more efficiently by rapidly
                designing and deploying software tools that solve real operational
                problems.
              </p>
              <p className="text-lg text-muted leading-relaxed">
                Rather than large, slow technology projects, we focus on small,
                targeted solutions that deliver immediate value. Each engagement
                begins with a problem and ends with a working solution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Beliefs */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 animate-in">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Our Philosophy
            </p>
            <h2>What We Believe</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {beliefs.map((belief, i) => (
              <div
                key={belief.title}
                className={`animate-in animate-in-delay-${i + 1} group bg-white rounded-2xl p-8 border border-border/70 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300`}
              >
                <div
                  className="text-3xl font-bold text-gradient-warm mb-4"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-bold mb-3">{belief.title}</h3>
                <p className="text-muted leading-relaxed">{belief.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Our Vision
          </p>
          <h2 className="mb-6">Where We&apos;re Going</h2>
          <p className="text-lg text-muted leading-relaxed mb-6">
            CrumbLabz aims to become the most trusted partner for businesses
            looking to modernize their operations through practical software
            solutions.
          </p>
          <p className="text-lg text-muted leading-relaxed mb-10">
            Technology should not be a barrier to efficiency. It should be a
            tool that is accessible, adaptable, and fast to implement.
          </p>
          <Magnetic>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lift transition-all duration-300 hover:-translate-y-0.5"
            >
              Start the Conversation
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </Magnetic>
        </div>
      </section>
    </ScrollRevealProvider>
  );
}
