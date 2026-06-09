import Link from "next/link";
import Magnetic from "@/components/motion/Magnetic";
import HeroShowcase from "@/components/sections/HeroShowcase";

export default function Hero() {
  return (
    <section className="grain relative bg-mesh-warm text-white min-h-[92vh] flex items-center overflow-hidden">
      {/* Soft vignette to seat the content */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal-dark/40 via-transparent to-charcoal-dark/40" />

      <div className="relative z-[2] w-full max-w-7xl mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-28 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        {/* Text */}
        <div>
          <p className="hero-fade-in inline-flex items-center gap-2 mb-6 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm font-medium text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Custom Tools for Smarter Operations
          </p>

          <h1 className="hero-fade-in hero-fade-in-delay-1 text-white text-balance mb-6">
            We build the tools that{" "}
            <span className="text-gradient-warm">improve your business</span>
          </h1>

          <p className="hero-fade-in hero-fade-in-delay-2 max-w-xl mb-10 text-lg md:text-xl text-white/55 leading-relaxed">
            You describe the problem. We design and build a working solution —
            often in days, not months.
          </p>

          <div className="hero-fade-in hero-fade-in-delay-3 flex flex-wrap gap-4">
            <Magnetic>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-7 py-4 rounded-xl text-base shadow-lift transition-all duration-300 hover:-translate-y-0.5"
              >
                Tell Us Your Headache
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                href="/how-it-works"
                className="inline-flex items-center border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold px-7 py-4 rounded-xl text-base backdrop-blur transition-all duration-300"
              >
                See How It Works
              </Link>
            </Magnetic>
          </div>

          {/* Trust line */}
          <div className="hero-fade-in hero-fade-in-delay-3 mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/45">
            <span>Days, not months</span>
            <span className="w-px h-4 bg-white/15" />
            <span>Built around your workflow</span>
            <span className="w-px h-4 bg-white/15" />
            <span>Real, working software</span>
          </div>
        </div>

        {/* Product showcase — animated crumbs → cookie → delivered software */}
        <div className="hero-fade-in hero-fade-in-delay-2 hidden lg:block">
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
}
