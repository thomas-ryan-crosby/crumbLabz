import type { ReactNode } from "react";

/**
 * Shared interior-page hero — warm mesh + film grain, matching the homepage
 * hero treatment so every page opens with the same Engineered Warmth feel.
 */
export default function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
}) {
  return (
    <section className="grain relative overflow-hidden bg-mesh-warm text-white pt-36 pb-24 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal-dark/40 via-transparent to-charcoal-dark/40" />
      <div className="relative z-[2] max-w-3xl mx-auto px-6 text-center">
        <p className="hero-fade-in inline-flex items-center gap-2 mb-5 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm font-medium text-white/70">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {eyebrow}
        </p>
        <h1 className="hero-fade-in hero-fade-in-delay-1 text-white mb-6 text-balance">
          {title}
        </h1>
        <p className="hero-fade-in hero-fade-in-delay-2 text-lg text-white/60 max-w-xl mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
