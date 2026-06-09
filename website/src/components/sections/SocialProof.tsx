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

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function SocialProof() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16 animate-in">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
            What Clients Say
          </p>
          <h2>Trusted by Businesses Like Yours</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className={`animate-in animate-in-delay-${i + 1} flex flex-col bg-cream rounded-2xl p-8 border border-border/60 shadow-soft hover:shadow-lift hover:-translate-y-1 transition-all duration-300`}
            >
              <div
                className="text-accent text-5xl leading-none mb-2"
                style={{ fontFamily: "var(--font-display)" }}
                aria-hidden
              >
                &ldquo;
              </div>
              <blockquote className="text-charcoal leading-relaxed mb-6 flex-1">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-border/70 pt-4">
                <span className="w-9 h-9 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                  {initials(t.author)}
                </span>
                <div>
                  <p className="font-semibold text-sm not-italic">{t.author}</p>
                  <p className="text-muted text-xs">{t.company}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
