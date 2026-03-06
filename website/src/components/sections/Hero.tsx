import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-charcoal text-white py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-white mb-6 max-w-4xl mx-auto">
          Turn Business Headaches Into Working Tools
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
          Describe the problem slowing down your business. CrumbLabz designs and
          builds solutions that make operations run smoother.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Tell Us Your Headache
        </Link>
      </div>
    </section>
  );
}
