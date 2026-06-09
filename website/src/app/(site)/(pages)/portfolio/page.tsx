"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolioProjects } from "@/lib/firebase";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import PageHero from "@/components/sections/PageHero";
import Magnetic from "@/components/motion/Magnetic";
import { type DisplayProject, FEATURED_PROJECTS } from "@/lib/featuredProjects";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<DisplayProject | null>(null);

  useEffect(() => {
    getPortfolioProjects()
      .then((p) => setProjects(p))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Featured showcases first, then anything enabled from the CRM.
  const allProjects: DisplayProject[] = [...FEATURED_PROJECTS, ...projects];

  return (
    <ScrollRevealProvider>
      <PageHero
        eyebrow="Portfolio"
        title={<>Our <span className="text-gradient-warm">Work</span></>}
        subtitle="Real solutions we've built for real businesses. Each project started with a problem and ended with a working tool."
      />

      {/* Projects */}
      <section className="py-20 md:py-28 bg-cream">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {allProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="text-left bg-white border border-border/70 rounded-2xl p-6 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-charcoal group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ml-3 ${
                      project.status === "active"
                        ? "bg-green-600/10 text-green-700"
                        : project.status === "completed"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-amber-500/10 text-amber-700"
                    }`}>
                      {project.status === "active" ? "Active" : project.status === "completed" ? "Delivered" : "In Progress"}
                    </span>
                  </div>

                  <p className="text-sm text-muted mb-4">{project.companyName}</p>

                  <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-3">
                    {project.portfolioDescription || "Custom software solution built to streamline operations and eliminate manual bottlenecks."}
                  </p>

                  {project.portfolioBenefits && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-accent uppercase tracking-wide mb-1">Impact</p>
                      <p className="text-sm text-charcoal/60 line-clamp-2">{project.portfolioBenefits}</p>
                    </div>
                  )}

                  <p className="text-xs text-accent font-medium mt-4 group-hover:underline">View details &rarr;</p>
                </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <span className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="grain relative overflow-hidden bg-mesh-warm text-white py-20 md:py-24">
        <div className="relative z-[2] max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-in text-white">
            Have a similar problem?
          </h2>
          <p className="text-white/60 mb-8 animate-in animate-in-delay-1">
            Every project starts with a conversation about what&apos;s slowing your business down.
          </p>
          <div className="animate-in animate-in-delay-2">
            <Magnetic>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl shadow-lift transition-all duration-300 hover:-translate-y-0.5"
              >
                Tell Us Your Headache
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* Detail modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-neutral hover:bg-border transition-colors text-charcoal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-charcoal">{selectedProject.name}</h2>
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ml-3 ${
                  selectedProject.status === "active"
                    ? "bg-green-600/10 text-green-700"
                    : selectedProject.status === "completed"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-amber-500/10 text-amber-700"
                }`}>
                  {selectedProject.status === "active" ? "Active" : selectedProject.status === "completed" ? "Delivered" : "In Progress"}
                </span>
              </div>
              <p className="text-muted mb-6">{selectedProject.companyName}</p>

              <div className="mb-6">
                <p className="text-charcoal/80 leading-relaxed">
                  {selectedProject.portfolioDescription || "Custom software solution built to streamline operations and eliminate manual bottlenecks."}
                </p>
              </div>

              {selectedProject.portfolioContent && (
                <div className="mb-6 border border-border rounded-xl p-4 overflow-hidden" dangerouslySetInnerHTML={{ __html: selectedProject.portfolioContent }} />
              )}

              {selectedProject.portfolioBenefits && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Client Impact</p>
                  <p className="text-charcoal/80 leading-relaxed">{selectedProject.portfolioBenefits}</p>
                </div>
              )}

              <div className="pt-4 border-t border-border text-center">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-xl shadow-lift transition-all duration-300 hover:-translate-y-0.5 text-sm"
                >
                  Start a Similar Project
                  <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScrollRevealProvider>
  );
}
