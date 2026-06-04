"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPortfolioProjects, type Project } from "@/lib/firebase";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

// The subset of Project fields the portfolio UI actually renders. Both the
// Firestore-backed projects and the hand-curated featured projects below
// satisfy this shape, so they share the same card and modal markup.
type DisplayProject = {
  id: string;
  name: string;
  companyName: string;
  status: Project["status"];
  portfolioDescription: string;
  portfolioBenefits: string;
  portfolioContent: string;
};

// Hand-curated showcase projects rendered ahead of any portfolio-enabled
// projects from Firestore. Copy is written to be accurate to each build with
// no invented metrics; the behavioral-health client is intentionally
// generalized rather than named.
const FEATURED_PROJECTS: DisplayProject[] = [
  {
    id: "featured-gscp",
    name: "GSCP Campaign Tracker",
    companyName: "Gulf South Commerce Park",
    status: "active",
    portfolioDescription:
      "A live lead-tracking dashboard for a demand-validation campaign — every prospect, contact detail, and pipeline stage in one searchable place. A scheduled AI routine researches new leads, fills in missing contact info, and drafts outreach emails for human review, while every inline edit is saved with a full per-field audit trail.",
    portfolioBenefits:
      "Replaced scattered spreadsheets with a single source of truth and automated the repetitive research and follow-up work — so the team spends its time on conversations, not data entry.",
    portfolioContent: "",
  },
  {
    id: "featured-sanctuary-household",
    name: "Household Analysis Manager",
    companyName: "Sanctuary HOA",
    status: "active",
    portfolioDescription:
      "A data-reconciliation tool that brings an HOA's residents, properties, vehicles, and entry tags into one place. It automatically surfaces duplicate and overlapping household records, supports merging and re-linking, and logs every change to a real-time, multi-user changelog.",
    portfolioBenefits:
      "Turned a tangle of duplicated, migrated records into clean, trustworthy household data — with an audit trail that makes every correction accountable.",
    portfolioContent: "",
  },
  {
    id: "featured-billing-approval",
    name: "Billing Approval Center",
    companyName: "Crosby Management",
    status: "active",
    portfolioDescription:
      "A digital replacement for a paper-based vendor-bill approval process spanning five business entities. Bills are uploaded as PDFs, key fields are extracted automatically by AI, and each bill moves through a real-time approval queue — with a claim-lock that prevents two approvers from working the same bill at once.",
    portfolioBenefits:
      "Collapsed a slow paper-routing process into a transparent digital queue, eliminating duplicate approvals and giving every bill a clean, compliant audit trail.",
    portfolioContent: "",
  },
  {
    id: "featured-viger-command",
    name: "Operations Command Center",
    companyName: "Multi-Location Behavioral Health Provider",
    status: "on_hold",
    portfolioDescription:
      "An executive command center that consolidates operations and financial data from multiple disconnected systems — EHR, accounting, and call tracking — into a single real-time view. Leadership can see admissions, census, payer performance, and revenue across every location without clicking between platforms.",
    portfolioBenefits:
      "Replaces hours of manual, multi-system report assembly with one consolidated dashboard, giving leadership the fast, location-level visibility they need to make operational decisions.",
    portfolioContent: "",
  },
];

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
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {allProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="text-left bg-white border border-border rounded-xl p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group"
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
