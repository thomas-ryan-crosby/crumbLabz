import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/solutions", label: "Solutions" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Image
              src="/images/CrumbLabz_Wordmark.png"
              alt="CrumbLabz"
              width={140}
              height={32}
              className="brightness-0 invert mb-4"
            />
            <p className="text-sm text-white/60 max-w-xs">
              Turning operational headaches into working tools. One problem at a time.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Navigation
            </h4>
            <nav className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-white/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">
              Get Started
            </h4>
            <p className="text-sm text-white/60 mb-4">
              Have a process that feels slow or frustrating? Let&apos;s talk about it.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Start the Conversation
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} CrumbLabz. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
