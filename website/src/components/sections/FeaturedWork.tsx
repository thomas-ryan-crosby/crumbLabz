"use client";

import { useState } from "react";
import Link from "next/link";
import { FEATURED_PROJECTS } from "@/lib/featuredProjects";

const STATUS = {
  active: { label: "Active", cls: "bg-green-600/10 text-green-700" },
  completed: { label: "Delivered", cls: "bg-blue-500/10 text-blue-600" },
  on_hold: { label: "In Progress", cls: "bg-amber-500/10 text-amber-700" },
} as const;

export default function FeaturedWork() {
  const [active, setActive] = useState(0);
  const project = FEATURED_PROJECTS[active];
  const status = STATUS[project.status] ?? STATUS.active;

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-14 animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            Selected Work
          </p>
          <h2 className="mb-5">Real tools, really shipped</h2>
          <p className="text-lg text-muted">
            A look at actual software we&apos;ve built for real businesses.
          </p>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[0.82fr_1.18fr] gap-8 items-start">
          {/* Project selector */}
          <div className="flex flex-col gap-3 animate-in">
            {FEATURED_PROJECTS.map((p, i) => {
              const isActive = i === active;
              const st = STATUS[p.status] ?? STATUS.active;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(i)}
                  className={`text-left rounded-2xl p-5 border transition-all duration-300 ${
                    isActive
                      ? "bg-cream border-accent/40 shadow-soft"
                      : "bg-white border-border/70 hover:border-accent/30 hover:bg-cream/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="text-base font-bold text-charcoal">{p.name}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{p.companyName}</p>
                  {isActive && (
                    <p className="text-sm text-charcoal/70 mt-3 leading-relaxed">
                      {p.portfolioDescription}
                    </p>
                  )}
                </button>
              );
            })}

            <Link
              href="/portfolio"
              className="group mt-2 inline-flex items-center gap-2 text-accent hover:text-accent-hover font-semibold text-sm transition-colors"
            >
              Explore the full portfolio
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          {/* Live product showcase */}
          <div className="animate-in animate-in-delay-1">
            <div className="rounded-3xl border border-border/70 bg-neutral shadow-lift p-5 md:p-7">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">{project.name}</h3>
                  <p className="text-sm text-muted">{project.companyName}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${status.cls}`}>
                  {status.label}
                </span>
              </div>

              <div className="rounded-2xl bg-white border border-border/60 overflow-x-auto">
                <div
                  className="p-4 min-w-[440px]"
                  dangerouslySetInnerHTML={{ __html: project.portfolioContent }}
                />
              </div>

              {project.portfolioBenefits && (
                <div className="mt-5 bg-accent/5 border border-accent/20 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-accent mb-1">Impact</p>
                  <p className="text-sm text-charcoal/80 leading-relaxed">
                    {project.portfolioBenefits}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: skip the interactive gallery, link straight to the portfolio */}
        <div className="lg:hidden">
          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-7 py-4 rounded-xl shadow-lift transition-all duration-300 hover:-translate-y-0.5"
          >
            Explore the full portfolio
            <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
