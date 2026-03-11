"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolioProjects, type Project } from "@/lib/firebase";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    getPortfolioProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollRevealProvider>
      {/* Hero */}
      <section className="relative bg-charcoal text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark/50 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 hero-fade-in">
            Our Work
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto hero-fade-in hero-delay-1">
            Real solutions we&apos;ve built for real businesses. Each project started with a problem and ended with a working tool.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted text-lg mb-4">Portfolio coming soon.</p>
              <p className="text-muted/70">We&apos;re preparing case studies of our recent work.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className={`animate-in ${i > 0 ? `animate-delay-${i}` : ""}`}
                >
                  {/* Project card */}
                  <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-accent/30 transition-all duration-300">
                    {/* Header */}
                    <div className="p-6 pb-4 border-b border-border">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold text-charcoal">{project.name}</h3>
                          <p className="text-sm text-muted mt-1">{project.companyName}</p>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                          project.status === "active"
                            ? "bg-green-600/10 text-green-700"
                            : project.status === "completed"
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-amber-500/10 text-amber-700"
                        }`}>
                          {project.status === "active" ? "Active" : project.status === "completed" ? "Delivered" : "In Progress"}
                        </span>
                      </div>

                      {project.portfolioDescription && (
                        <p className="text-charcoal/70 leading-relaxed">{project.portfolioDescription}</p>
                      )}
                    </div>

                    {/* AI-generated showcase */}
                    {project.portfolioContent && (
                      <div className="p-6">
                        <div dangerouslySetInnerHTML={{ __html: project.portfolioContent }} />
                      </div>
                    )}

                    {/* Benefits footer */}
                    {project.portfolioBenefits && (
                      <div className="px-6 pb-6">
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Client Impact</p>
                          <p className="text-charcoal/80 leading-relaxed">{project.portfolioBenefits}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-in">
            Have a similar problem?
          </h2>
          <p className="text-white/60 mb-8 animate-in animate-delay-1">
            Every project starts with a conversation about what&apos;s slowing your business down.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-lg transition-colors animate-in animate-delay-2"
          >
            Tell Us Your Headache
          </Link>
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
            className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
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

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-charcoal">{selectedProject.name}</h2>
                  <p className="text-muted mt-1">{selectedProject.companyName}</p>
                </div>
                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                  selectedProject.status === "active"
                    ? "bg-green-600/10 text-green-700"
                    : selectedProject.status === "completed"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-amber-500/10 text-amber-700"
                }`}>
                  {selectedProject.status === "active" ? "Active" : selectedProject.status === "completed" ? "Delivered" : "In Progress"}
                </span>
              </div>

              {selectedProject.portfolioDescription && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-muted mb-2">Overview</h3>
                  <p className="text-charcoal/80 leading-relaxed whitespace-pre-wrap">{selectedProject.portfolioDescription}</p>
                </div>
              )}

              {selectedProject.portfolioContent && (
                <div className="mb-6" dangerouslySetInnerHTML={{ __html: selectedProject.portfolioContent }} />
              )}

              {selectedProject.portfolioBenefits && (
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <h3 className="text-sm font-bold uppercase tracking-wide text-accent mb-2">Client Impact</h3>
                  <p className="text-charcoal/80 leading-relaxed whitespace-pre-wrap">{selectedProject.portfolioBenefits}</p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-border text-center">
                <Link
                  href="/contact"
                  className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Start a Similar Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScrollRevealProvider>
  );
}
