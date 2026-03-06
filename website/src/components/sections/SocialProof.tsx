const testimonials = [
  {
    quote: "CrumbLabz turned a process that took our team 6 hours a week into something that runs automatically. We should have done this years ago.",
    author: "Operations Manager",
    company: "Regional Services Firm",
  },
  {
    quote: "We described the problem on Monday and had a working tool by Friday. The speed is unreal.",
    author: "Business Owner",
    company: "Growing E-Commerce Company",
  },
  {
    quote: "They didn't try to sell us a massive project. They listened, built exactly what we needed, and it just works.",
    author: "Founder",
    company: "Professional Services Startup",
  },
];

export default function SocialProof() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16 animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            What Clients Say
          </p>
          <h2>Trusted by Businesses Like Yours</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`animate-in animate-in-delay-${i + 1} bg-neutral rounded-xl p-8 border border-border relative`}
            >
              {/* Quote mark */}
              <div className="text-accent/20 text-6xl font-serif leading-none absolute top-4 right-6">
                &ldquo;
              </div>
              <p className="text-charcoal leading-relaxed mb-6 relative">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-sm">{t.author}</p>
                <p className="text-muted text-xs">{t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
