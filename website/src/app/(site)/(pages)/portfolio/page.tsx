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
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className={`animate-in ${i % 2 === 1 ? "animate-delay-1" : ""} group bg-white border border-border rounded-xl overflow-hidden hover:shadow-xl hover:border-accent/30 transition-all duration-300 cursor-pointer`}
                  onClick={() => setSelectedProject(project)}
                >
                  {/* Screenshot preview */}
                  {project.portfolioScreenshots.length > 0 ? (
                    <div className="relative h-56 overflow-hidden bg-neutral">
                      <img
                        src={project.portfolioScreenshots[0]}
                        alt={`${project.name} screenshot`}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                      {project.portfolioScreenshots.length > 1 && (
                        <span className="absolute bottom-3 right-3 text-xs font-medium text-white/80 bg-charcoal/50 backdrop-blur-sm px-2 py-1 rounded-full">
                          +{project.portfolioScreenshots.length - 1} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-neutral to-border flex items-center justify-center">
                      <svg className="w-16 h-16 text-muted/30" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-charcoal group-hover:text-accent transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-sm text-muted mt-0.5">{project.companyName}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0 ${
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
                      <p className="text-sm text-charcoal/70 leading-relaxed mb-4 line-clamp-3">
                        {project.portfolioDescription}
                      </p>
                    )}

                    {project.portfolioBenefits && (
                      <div className="border-t border-border pt-3">
                        <p className="text-xs font-medium text-accent uppercase tracking-wide mb-1">Impact</p>
                        <p className="text-sm text-charcoal/70 line-clamp-2">{project.portfolioBenefits}</p>
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

            {/* Screenshots gallery */}
            {selectedProject.portfolioScreenshots.length > 0 && (
              <div className="space-y-2 p-4 pb-0">
                {selectedProject.portfolioScreenshots.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${selectedProject.name} screenshot ${i + 1}`}
                    className="w-full rounded-lg border border-border"
                  />
                ))}
              </div>
            )}

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
