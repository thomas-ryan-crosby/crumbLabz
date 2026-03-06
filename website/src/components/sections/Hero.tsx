import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative bg-charcoal text-white min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-dark via-charcoal to-charcoal-light" />

      <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-40 grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <p className="hero-fade-in text-accent font-semibold text-sm uppercase tracking-widest mb-4">
            Custom Tools for Smarter Operations
          </p>
          <h1 className="hero-fade-in hero-fade-in-delay-1 text-white mb-6">
            We Build the Tools That Improve Your Business
          </h1>
          <p className="hero-fade-in hero-fade-in-delay-2 text-lg md:text-xl text-white/60 max-w-lg mb-10 leading-relaxed">
            You describe the problem. We design and build a working solution —
            often in days, not months.
          </p>
          <div className="hero-fade-in hero-fade-in-delay-3 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-base transition-colors"
            >
              Tell Us Your Headache
            </Link>
            <Link
              href="/how-it-works"
              className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-lg text-base transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Logo graphic */}
        <div className="hero-fade-in hero-fade-in-delay-2 hidden md:flex justify-center items-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-accent/10 rounded-full blur-3xl" />
            <Image
              src="/images/CrumbLabz_Cookie.png"
              alt="CrumbLabz"
              width={320}
              height={320}
              className="relative drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
