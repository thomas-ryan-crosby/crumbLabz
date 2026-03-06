import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="mb-6">Start With One Problem</h2>
        <p className="text-lg text-muted mb-10">
          Tell us about a process in your business that feels slow, repetitive,
          or frustrating. CrumbLabz will help map the problem and build a
          solution.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
        >
          Start the Conversation
        </Link>
      </div>
    </section>
  );
}
