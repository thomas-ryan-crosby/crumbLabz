import type { Metadata } from "next";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";
import ContactPageClient from "./ContactPageClient";

export const metadata: Metadata = {
  title: "Contact — CrumbLabz",
  description: "Tell us about a problem your business is facing. CrumbLabz will help design a solution.",
};

export default function ContactPage() {
  return (
    <ScrollRevealProvider>
      {/* Hero */}
      <section className="bg-charcoal text-white pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="hero-fade-in text-accent font-semibold text-sm uppercase tracking-widest mb-4">
            Let&apos;s Talk
          </p>
          <h1 className="hero-fade-in hero-fade-in-delay-1 text-white mb-6">Tell Us Your Headache</h1>
          <p className="hero-fade-in hero-fade-in-delay-2 text-lg text-white/60 max-w-xl mx-auto">
            Describe a process in your business that feels slow, repetitive, or
            frustrating. We&apos;ll map the problem and show you what a solution looks like.
          </p>
        </div>
      </section>

      {/* Chat + Form */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6 animate-in">
          <ContactPageClient />
        </div>
      </section>
    </ScrollRevealProvider>
  );
}
